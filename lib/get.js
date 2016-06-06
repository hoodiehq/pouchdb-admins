module.exports = getAdmin

var Promise = require('lie')
var PouchDBErrors = require('pouchdb-errors')

var toAdminDoc = require('./utils/admin-hash-to-doc')

function getAdmin (state, username) {
  if (state.admins[username]) {
    return Promise.resolve(toAdminDoc(username, state.admins[username]))
  }

  return Promise.reject(PouchDBErrors.MISSING_DOC)
}
