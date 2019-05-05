/**
 * Contains all routes
 */

const constants = require('../app-constants')

module.exports = {
  '/login': {
    post: { controller: 'SecurityController', method: 'login', public: true }
  },
  '/forgotPassword': {
    get: { controller: 'SecurityController', method: 'forgotPassword', public: true }
  },
  '/changeForgotPassword': {
    get: { controller: 'SecurityController', method: 'changeForgotPassword', public: true }
  },
  '/resetPassword': {
    post: { controller: 'SecurityController', method: 'resetPassword' }
  },

  '/user': {
    get: {
      controller: 'UserController',
      method: 'searchUsers',
      roles: [constants.UserRoles.Admin, constants.UserRoles.User]
    },
    post: {
      controller: 'UserController',
      method: 'createUser',
      // roles: [constants.UserRoles.Admin, constants.UserRoles.User]
      public: true
    }
  },
  '/user/:userId': {
    get: { controller: 'UserController', method: 'getUser' },
    put: {
      controller: 'UserController',
      method: 'updateUser',
      roles: [constants.UserRoles.Admin, constants.UserRoles.User]
    }
  },
  '/user/link/:clientId': {
    put: {
      controller: 'UserController',
      method: 'linkClient',
      roles: [constants.UserRoles.Admin, constants.UserRoles.User]
    }
  },
  '/user/unlink/:clientId': {
    delete: {
      controller: 'UserController',
      method: 'unlinkClient',
      roles: [constants.UserRoles.Admin, constants.UserRoles.User]
    }
  },
  '/user/:userId/link/:clientId': {
    put: { controller: 'UserController', method: 'linkClientToUser', roles: [constants.UserRoles.Admin] }
  },
  '/user/:userId/unlink/:clientId': {
    delete: { controller: 'UserController', method: 'unlinkClientFromUser', roles: [constants.UserRoles.Admin] }
  }
}
