/**
 * Controller for user endpoints
 */
const service = require('../services/UserService')

/**
 * Search users
 * @param req the request
 * @param res the response
 */
async function searchUsers (req, res) {
  res.send(await service.searchUsers(req.user, req.query))
}

/**
 * Create user
 * @param req the request
 * @param res the response
 */
async function createUser (req, res) {
  res.send(await service.createUser({role:1}, req.body))
}

/**
 * Update user
 * @param req the request
 * @param res the response
 */
async function updateUser (req, res) {
  res.send(await service.updateUser(req.user, req.params.userId, req.body))
}

/**
 * Get user
 * @param req the request
 * @param res the response
 */
async function getUser (req, res) {
  res.send(await service.getUser(req.params.userId))
}

/**
 * Link client to current user
 * @param req the request
 * @param res the response
 */
async function linkClient (req, res) {
  await service.linkClient(req.user, req.params.clientId)
  res.end()
}

/**
 * Unlink client from current user
 * @param req the request
 * @param res the response
 */
async function unlinkClient (req, res) {
  await service.unlinkClient(req.user, req.params.clientId)
  res.end()
}

/**
 * Link client to specified user
 * @param req the request
 * @param res the response
 */
async function linkClientToUser (req, res) {
  await service.linkClientToUser(req.user._id, req.params.userId, req.params.clientId)
  res.end()
}

/**
 * Unlink client from specified user
 * @param req the request
 * @param res the response
 */
async function unlinkClientFromUser (req, res) {
  await service.unlinkClientFromUser(req.user._id, req.params.userId, req.params.clientId)
  res.end()
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
