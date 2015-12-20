module.exports = validatePassword

var crypto = require('crypto')

var Promise = require('lie')

var getAdmin = require('./get')

var NUM_ITERATIONS = 10

function validatePassword (state, username, password) {
  return getAdmin(state, username)

  .then(function (doc) {
    return new Promise(function (resolve, reject) {
      crypto.pbkdf2(password, doc.salt, NUM_ITERATIONS, 20, function (error, derivedKeyCheck) {
        if (error) {
          return reject(error)
        }

        if (derivedKeyCheck.toString('hex') !== doc.derived_key) {
          return reject(state.db.constructor.Errors.UNAUTHORIZED)
        }

        resolve()
      })
    })
  })
}
