module.exports = setAdmin

var format = require('util').format

var Promise = require('lie')

var generateSalt = require('./utils/generate-salt')
var hashPassword = require('./utils/hash-password')

var NUM_ITERATIONS = 10
var PASSWORD_SCHEME = 'pbkdf2'

function setAdmin (state, username, password) {
  return new Promise(function (resolve, reject) {
    var salt = generateSalt()

    hashPassword(
      password,
      salt,
      NUM_ITERATIONS,
      function (error, hash) {
        if (error) {
          return reject(error)
        }

        state.admins[username] = format(
          '-%s-%s,%s,%s',
          PASSWORD_SCHEME,
          hash,
          salt,
          NUM_ITERATIONS
        )
        resolve()
      }
    )
  })
}
