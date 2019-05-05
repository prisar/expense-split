const _ = require('lodash')
const mongoose = require('mongoose')
const validator = require('validator')
const constants = require('../../app-constants')

/**
 * The User schema.
 */
const schema = new mongoose.Schema({
  name: {
    required: true,
    type: String
  },
  email: {
    required: true,
    type: String,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'email is invalid',
      isAsync: false
    }
  },
  passwordHash: {
    required: true,
    type: String
  },
  role: {
    required: true,
    type: String,
    enum: _.values(constants.UserRoles)
  },
  company: {
    required: false,
    type: String
  },
  phone: {
    required: false,
    type: String
  },
  // agent is applicable for client
  agent: {
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  forgotPasswordToken: {
    required: false,
    type: String
  },
  forgotPasswordTokenValidUntil: {
    required: false,
    type: Date
  },
  defaults: {
    required: false,
    type: {
      softCost: String,
      infraCost: String,
      laborCost: String,
      laborUtil: String,
      nummTests: String,
      avgDefects: String
    }
  },
  avatarUrl: {
    required: false,
    type: String
  }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'lastModifiedOn' } })

schema.index({ email: 1 })
schema.index({ role: 1 })

module.exports = schema
