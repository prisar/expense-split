/**
 * This service provides operations of users
 */
const _ = require('lodash')
const Joi = require('joi')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const models = require('../models')
const constants = require('../../app-constants')

const User = models.User

/**
 * Search users
 * @param {Object} currentUser the current users
 * @param {Object} criteria the search criteria
 * @returns {Object} the search result
 */
async function searchUsers (currentUser, criteria) {
  // build filter object
  const filter = {}
  if (criteria.name) {
    filter.name = new RegExp(criteria.name, 'i')
  }
  if (criteria.email) {
    filter.email = criteria.email
  }
  if (criteria.role) {
    filter.role = criteria.role
  }
  if (criteria.company) {
    filter.company = new RegExp(criteria.company, 'i')
  }
  if (criteria.phone) {
    filter.phone = new RegExp(criteria.phone, 'i')
  }
  if (criteria.keyword) {
    filter.$or = [{ name: new RegExp(criteria.keyword, 'i') }, { email: criteria.keyword.toLowerCase() }]
  }
  if (criteria.fullName) {
    filter.name = new RegExp(criteria.fullName, 'i')
  }
  if (currentUser.role === constants.UserRoles.User) {
    filter.agent = currentUser.id
  }

  // query total count
  const totalCount = await User.count(filter)
  // query records
  // for sorting, add second sorting by _id if sortColumn is not id, so that result order is determined
  if (criteria.sortColumn === 'id') {
    criteria.sortColumn = '_id'
  }
  let sortStr = `${criteria.sortOrder.toLowerCase() === 'asc' ? '' : '-'}${criteria.sortColumn}`
  if (criteria.sortColumn !== '_id') {
    sortStr += ' _id'
  }
  let p = User.find(filter).sort(sortStr).skip(criteria.skip)
  if (criteria.limit) {
    p = p.limit(criteria.limit)
  }
  const results = await p
  for (let i = 0; i < results.length; i += 1) {
    results[i] = await helper.cleanAndPopulateDataForUser(results[i])
  }
  return { totalCount, results }
}

searchUsers.schema = {
  currentUser: Joi.object().required(),
  criteria: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email().lowercase(),
    role: Joi.string().valid(_.values(constants.UserRoles)),
    company: Joi.string(),
    phone: Joi.string(),
    skip: Joi.number().integer().min(0).default(0),
    limit: Joi.number().integer().min(1),
    sortColumn: Joi.string().valid('id', 'name', 'email', 'role', 'company', 'phone',
      'createdOn', 'lastModifiedOn').default('createdOn'),
    sortOrder: Joi.sortOrder()
  })
}

/**
 * Create user. Password email is sent to user if no password is provided.
 * @param {Object} currentUser the current user
 * @param {Object} data the data to create user
 * @returns {Object} the created user
 */
async function createUser (currentUser, data) {
  // check role
  if (currentUser.role === constants.UserRoles.User && data.role !== constants.UserRoles.Client) {
    throw new errors.ForbiddenError(`User role can only create clients`)
  }

  // check whether email is already used
  const existing = await User.findOne({ email: data.email })
  if (existing) {
    throw new errors.ConflictError(`The email ${data.email} is already created`)
  }

  // generate password if not provided
  let generatedPassword = null
  if (!data.password) {
    generatedPassword = helper.generatePassword()
    data.password = generatedPassword
  }
  // hash password
  data.passwordHash = await helper.hashString(data.password)
  delete data.password
  // create user
  data.createdBy = currentUser._id
  const user = await User.create(data)

  // send password email if needed
  // client won't login, so no need to send password to client
  if (generatedPassword && data.role !== constants.UserRoles.Client) {
    const emailTemplate = require('../emailTemplate/passwordEmail')
    const emailBody = emailTemplate.body.replace('{password}', generatedPassword)
    await helper.sendEmail(emailTemplate.subject, emailBody, [data.email])
  }

  return helper.cleanAndPopulateDataForUser(user)
}

createUser.schema = {
  currentUser: Joi.object().required(),
  data: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.email(), // defined in app-bootstrap
    password: Joi.string(),
    role: Joi.string().valid(_.values(constants.UserRoles)).required(),
    company: Joi.string(),
    phone: Joi.string(),
    avatarUrl: Joi.string().uri()
  }).required()
}

/**
 * Update user. Password email is sent to user if no password is provided.
 * @param {Object} currentUser the current user
 * @param {String} userId the id of user to update
 * @param {Object} data the data to update user
 * @returns {Object} the updated user
 */
async function updateUser (currentUser, userId, data) {
  if (data.defaults) {
    helper.validateDefaults(data.defaults)
  }
  const user = await helper.ensureExists(User, userId)

  let generatedPassword = null

  if (currentUser.role === constants.UserRoles.Admin) {
    // check whether email is already used by other user
    const existing = await User.findOne({ _id: { $ne: userId }, email: data.email })
    if (existing) {
      throw new errors.ConflictError(`The email ${data.email} is already used by other user`)
    }
    // generate password if not provided
    if (!data.password) {
      generatedPassword = helper.generatePassword()
      data.password = generatedPassword
    }
    // hash password
    data.passwordHash = await helper.hashString(data.password)
    delete data.password
  } else {
    if (String(user.agent) !== String(currentUser.id) || userId !== String(currentUser.id)) {
      throw new errors.ForbiddenError(`User role can only update himself/herself or his/her client`)
    }
  }

  // update user
  if (currentUser.role === constants.UserRoles.User) {
    // only update defaults if User peform update operation
    _.assignIn(user, _.pick(data, 'defaults'))
  } else {
    _.assignIn(user, data)
  }

  user.lastModifiedBy = currentUser._id
  const updatedUser = await user.save()

  // send password email if needed
  // client won't login, so no need to send password to client
  if (generatedPassword && data.role !== constants.UserRoles.Client) {
    const emailTemplate = require('../emailTemplate/passwordEmail')
    const emailBody = emailTemplate.body.replace('{password}', generatedPassword)
    await helper.sendEmail(emailTemplate.subject, emailBody, [data.email])
  }

  return helper.cleanAndPopulateDataForUser(updatedUser)
}

updateUser.schema = {
  currentUser: Joi.object().required(),
  userId: Joi.id(), // defined in app-bootstrap
  data: Joi.object().keys({
    name: Joi.alternatives().when('currentUser.role', {
      is: constants.UserRoles.Admin,
      then: Joi.string().required(),
      otherwise: Joi.string()
    }),
    email: Joi.alternatives().when('currentUser.role', {
      is: constants.UserRoles.Admin,
      then: Joi.email(), // defined in app-bootstrap
      otherwise: Joi.string()
    }),
    password: Joi.string(),
    role: Joi.alternatives().when('currentUser.role', {
      is: constants.UserRoles.Admin,
      then: Joi.string().valid(_.values(constants.UserRoles)).required(),
      otherwise: Joi.string()
    }),
    company: Joi.string(),
    phone: Joi.string(),
    avatarUrl: Joi.string().uri(),
    defaults: Joi.object().keys({
      softCost: Joi.string(),
      infraCost: Joi.string(),
      laborCost: Joi.string(),
      laborUtil: Joi.string(),
      nummTests: Joi.string(),
      avgDefects: Joi.string()
    })
  }).required()
}

/**
 * Get user.
 * @param {String} userId the id of user to get
 * @returns {Object} the user
 */
async function getUser (userId) {
  const user = await helper.ensureExists(User, userId)
  return helper.cleanAndPopulateDataForUser(user)
}

getUser.schema = {
  userId: Joi.id() // defined in app-bootstrap
}

/**
 * Link client to current user
 * @param {Object} currentUser the current user
 * @param {String} clientId the client id
 */
async function linkClient (currentUser, clientId) {
  const client = await helper.ensureExists(User, { _id: clientId, role: constants.UserRoles.Client })
  if (currentUser.role === constants.UserRoles.User && String(currentUser._id) !== String(client.createdBy)) {
    throw new errors.ForbiddenError('You can only link client created by yourself')
  }
  client.agent = currentUser._id
  client.lastModifiedBy = currentUser._id
  await client.save()
}

linkClient.schema = {
  currentUser: Joi.object().required(),
  clientId: Joi.id() // defined in app-bootstrap
}

/**
 * Unlink client from current user
 * @param {Object} currentUser the current user
 * @param {String} clientId the client id
 */
async function unlinkClient (currentUser, clientId) {
  const client = await helper.ensureExists(User, { _id: clientId, role: constants.UserRoles.Client })
  if (!client.agent || String(client.agent) !== String(currentUser._id)) {
    throw new errors.BadRequestError('The client was not linked to current user')
  }
  if (currentUser.role === constants.UserRoles.User && String(currentUser._id) !== String(client.createdBy)) {
    throw new errors.ForbiddenError('You can only unlink client created by yourself')
  }
  client.agent = null
  client.lastModifiedBy = currentUser._id
  await client.save()
}

unlinkClient.schema = {
  currentUser: Joi.object().required(),
  clientId: Joi.id() // defined in app-bootstrap
}

/**
 * Link client to specified user
 * @param {String} currentUserId the current user id
 * @param {String} userId the user id to link client
 * @param {String} clientId the client id
 */
async function linkClientToUser (currentUserId, userId, clientId) {
  const user = await helper.ensureExists(User, userId)
  if (user.role === constants.UserRoles.Client) {
    throw new errors.BadRequestError('Client can not link to client')
  }
  const client = await helper.ensureExists(User, { _id: clientId, role: constants.UserRoles.Client })
  client.agent = userId
  client.lastModifiedBy = currentUserId
  await client.save()
}

linkClientToUser.schema = {
  currentUserId: Joi.any().required(), // internal data, no need to validate it
  userId: Joi.id(), // defined in app-bootstrap
  clientId: Joi.id() // defined in app-bootstrap
}

/**
 * Unlink client from specified user
 * @param {String} currentUserId the current user id
 * @param {String} userId the user id to unlink client
 * @param {String} clientId the client id
 */
async function unlinkClientFromUser (currentUserId, userId, clientId) {
  const user = await helper.ensureExists(User, userId)
  if (user.role === constants.UserRoles.Client) {
    throw new errors.BadRequestError('Can not unlink client for client')
  }
  const client = await helper.ensureExists(User, { _id: clientId, role: constants.UserRoles.Client })
  if (!client.agent || String(client.agent) !== String(userId)) {
    throw new errors.BadRequestError('The client was not linked to the user')
  }
  client.agent = null
  client.lastModifiedBy = currentUserId
  await client.save()
}

unlinkClientFromUser.schema = {
  currentUserId: Joi.any().required(), // internal data, no need to validate it
  userId: Joi.id(), // defined in app-bootstrap
  clientId: Joi.id() // defined in app-bootstrap
}

module.exports = {
  searchUsers,
  createUser,
  updateUser,
  getUser,
  linkClient,
  unlinkClient,
  linkClientToUser,
  unlinkClientFromUser
}

logger.buildService(module.exports)
