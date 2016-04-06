module.exports = adminsApi

var clone = require('lodash/clone')

function adminsApi (options) {
  var db = this
  var state = {
    db: db,
    secret: options.secret,
    admins: options.admins ? clone(options.admins) : {},
    sessionTimeout: options.sessionTimeout
  }

  return {
    get: require('./get').bind(null, state),
    set: require('./set').bind(null, state),
    validatePassword: require('./validate-password').bind(null, state),
    calculateSessionId: require('./calculate-session-id').bind(null, state),
    validateSession: require('./validate-session').bind(null, state)
  }
}
