var test = require('tape')
var adminHashToDoc = require('../../../lib/utils/admin-hash-to-doc')

var username = 'myTestAdminUser'

test('admin-hash-to-doc', function (group) {

  group.test('when passed hash does not conform to the expected format', function(t) {
    t.plan(1)
    var hash = 'this is just wrong'

    t.equal(adminHashToDoc(username, hash), undefined, 'will return an undefined value')
  })

  group.test('when passed hash conforms to the expected format', function(t) {
    t.plan(1)
    var hash = '-pbkdf2-01234abc,56789def,2000'

    t.deepEqual(adminHashToDoc(username, hash), {
      _id: 'org.couchdb.user:' + username,
      type: 'user',
      name: username,
      password_scheme: 'pbkdf2',
      derived_key: '01234abc',
      salt: '56789def',
      iterations: 2000,
      roles: ['_admin']
    }, 'will return an object with user details')
  })

  group.end()
})
