/**
 * This file defines helper methods
 */
const _ = require('lodash')
const errors = require('./errors')
const config = require('config')
const bcrypt = require('bcryptjs')
const util = require('util')
const logger = require('./logger')
const nodemailer = require('nodemailer')
const models = require('../models')
const constants = require('../../app-constants')

global.Promise.promisifyAll(bcrypt)

const transporter = nodemailer.createTransport(_.extend(config.EMAIL, { logger }))

const User = models.User

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Ensure entity exists for given criteria. Return error if no result.
 * @param {Object} Model the mongoose model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @returns {Object} the found entity
 */
async function ensureExists (Model, criteria) {
  let query
  let byId = true
  if (_.isObject(criteria)) {
    byId = false
    query = Model.findOne(criteria)
  } else {
    query = Model.findById(criteria)
  }
  const result = await query
  if (!result) {
    let msg
    if (byId) {
      msg = util.format('%s not found with id: %s', Model.modelName, criteria)
    } else {
      msg = util.format('%s not found with criteria: %j', Model.modelName, criteria)
    }
    throw new errors.NotFoundError(msg)
  }
  return result
}

/**
 * Hash the given text.
 *
 * @param {String} text the text to hash
 * @returns {String} the hashed string
 */
async function hashString (text) {
  return bcrypt.hashAsync(text, config.PASSWORD_HASH_SALT_LENGTH)
}

/**
 * Validate that the hash is actually the hashed value of plain text
 *
 * @param {String} text   the text to validate
 * @param {String} hash   the hash to validate
 * @returns {Boolean} whether it is valid
 */
async function validateHash (text, hash) {
  return bcrypt.compareAsync(text, hash)
}

/**
 * Send email
 * @param {String} subject the subject
 * @param {String} textBody the email body text
 * @param {Array} recipients the to emails
 * @param {String} fromEmail the from email, if not provided, then configured from email is used
 */
async function sendEmail (subject, textBody, recipients, fromEmail) {
  const req = {
    from: fromEmail || config.FROM_EMAIL,
    to: recipients.join(','),
    subject,
    text: textBody
  }
  await new Promise((resolve, reject) => {
    transporter.sendMail(req, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Generate random password.
 * @returns {String} generated random password
 */
function generatePassword () {
  let password = ''
  for (let i = 1; i <= 6; i += 1) {
    password += Math.floor(Math.random() * 10)
  }
  return password
}

/**
 * Clean and populate data for user
 * @param {Object} user the user to clean and populate data
 * @returns {Object} the cleaned and populated user
 */
async function cleanAndPopulateDataForUser (user) {
  let u = user.toJSON ? user.toJSON() : user
  u = _.pick(u, ['id', 'name', 'email', 'role', 'company', 'phone', 'agent', 'clients', 'defaults',
    'avatarUrl', 'createdBy', 'lastModifiedBy', 'createdOn', 'lastModifiedOn'])
  // populate clients
  if (u.role !== constants.UserRoles.Client) {
    const clients = await User.find({ role: constants.UserRoles.Client, agent: u.id }).select('_id')
    u.clients = _.map(clients, c => c._id)
  }
  return u
}

/**
 * Validate answer
 * @param {Object} question the question
 * @param {String} answerValue the answer
 */
function validateAnswer (question, answerValue) {
  if (!_.find(question.possibleAnswers, answer => _.isObject(answer)
    ? answer.key === answerValue : answer === answerValue)) {
    throw new errors.BadRequestError(`'${answerValue}' is not a possible answer for question '${question.question}'`)
  }
}

/**
 * Validate value is number
 * @param {String} value the value to be validated
 * @param {String} name the parameter name
 */
function validateNumber (value, name) {
  if (isNaN(value) || Number(value) < 0) {
    throw new errors.BadRequestError(`${name} should be non-negative number`)
  }
}

/**
 * Validate value is integer
 * @param {String} value the value to be validated
 * @param {String} name the parameter name
 */
function validateInteger (value, name) {
  validateNumber(value, name)
  if (!Number.isInteger(Number(value))) {
    throw new errors.BadRequestError(`${name} should be non-negative integer`)
  }
}

/**
 * Validate value is percentage
 * @param {String} value the value to be validated
 * @param {String} name the parameter name
 */
function validatePercentage (value, name) {
  if (value.endsWith('%')) {
    const number = Number(value.substr(0, value.length - 1))
    if (!isNaN(number) && number >= 0 && number <= 100) {
      return
    }
  }
  throw new errors.BadRequestError(`${name} should be percentage between 0% and 100%`)
}

/**
 * Validate user defaults
 * @param {Object} defaults the user defaults
 */
function validateDefaults (defaults) {
  if (defaults.softCost) {
    validateNumber(defaults.softCost, 'softCost')
  }
  if (defaults.infraCost) {
    validateNumber(defaults.infraCost, 'infraCost')
  }
  if (defaults.laborCost) {
    validateNumber(defaults.laborCost, 'laborCost')
  }
  if (defaults.laborUtil) {
    validatePercentage(defaults.laborUtil, 'laborUtil')
  }
  if (defaults.nummTests) {
    validateInteger(defaults.nummTests, 'nummTests')
  }
  if (defaults.avgDefects) {
    validateInteger(defaults.avgDefects, 'avgDefects')
  }
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  ensureExists,
  hashString,
  validateHash,
  sendEmail,
  generatePassword,
  cleanAndPopulateDataForUser,
  validateAnswer,
  validateDefaults
}
