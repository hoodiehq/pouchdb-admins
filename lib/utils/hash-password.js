module.exports = hashPassword

var crypto = require('crypto')

function hashPassword (password, salt, iterations, callback) {
  crypto.pbkdf2(password, salt, iterations, 20, function (error, derivedKey) {
    if (error) {
      return callback(error)
    }

    callback(null, derivedKey.toString('hex'))
  })
}
