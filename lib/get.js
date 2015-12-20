module.exports = getAdmin

var Promise = require('lie')

var toAdminDoc = require('./utils/admin-hash-to-doc')

function getAdmin (state, username) {
  if (state.admins[username]) {
    return Promise.resolve(toAdminDoc(username, state.admins[username]))
  }

  return Promise.reject(state.db.constructor.Errors.MISSING_DOC)
}
