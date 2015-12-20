module.exports = toAdminDoc

var regexAdminParts = /^-pbkdf2-([\da-f]+),([\da-f]+),([0-9]+)$/

function toAdminDoc (username, hash) {
  var info = hash.match(regexAdminParts)

  if (!info) {
    return
  }

  return {
    _id: 'org.couchdb.user:' + username,
    type: 'user',
    name: username,
    password_scheme: 'pbkdf2',
    derived_key: info[1],
    salt: info[2],
    iterations: parseInt(info[3], 10),
    roles: ['_admin']
  }
}
