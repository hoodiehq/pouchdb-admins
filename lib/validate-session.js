module.exports = validateSession

var calculateSessionId = require('couchdb-calculate-session-id')
var PouchDBErrors = require('pouchdb-errors')

var decodeSessionId = require('./utils/couchdb-decode-session-id')

var getAdmin = require('./get')

function validateSession (state, sessionId) {
  var session = decodeSessionId(sessionId)

  return getAdmin(state, session.username)

  .then(function (doc) {
    var sessionIdCheck = calculateSessionId(
      session.username,
      doc.salt,
      state.secret,
      session.timestamp
    )

    if (sessionIdCheck !== sessionId) {
      throw PouchDBErrors.UNAUTHORIZED
    }
  })
}
