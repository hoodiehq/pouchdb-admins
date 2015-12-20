module.exports = calculateAdminSessionId

var calculateSessionId = require('couchdb-calculate-session-id')

var getAdmin = require('./get')

function calculateAdminSessionId (state, username, timeout) {
  return getAdmin(state, username)

  .then(function (doc) {
    var timestamp = Math.floor(Date.now() / 1000) + (state.sessionTimeout || timeout)
    return calculateSessionId(doc.name, doc.salt, state.secret, timestamp)
  })
}
