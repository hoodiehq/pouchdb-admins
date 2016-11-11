var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-memory'))
var test = require('tape')
var Promise = require('lie')
var format = require('util').format
var hashPassword = require('../../lib/utils/hash-password')
var generateSalt = require('../../lib/utils/generate-salt')

var plugin = require('../../index')

test('db.admins({secret: "secret123"})', function (t) {
  t.plan(22)

  PouchDB.plugin(plugin)
  var db = new PouchDB('foo')
  t.is(typeof db.admins, 'function', 'db.admins is a function')

  var preinitializedAdmins
  var admins = db.admins({secret: 'secret123'})
  t.is(typeof admins.get, 'function', 'admins.get is a function')
  t.is(typeof admins.set, 'function', 'admins.set is a function')
  t.is(typeof admins.validatePassword, 'function', 'admins.validatePassword is a function')
  t.is(typeof admins.calculateSessionId, 'function', 'admins.calculateSessionId is a function')
  t.is(typeof admins.validateSession, 'function', 'admins.calculateSessionId is a function')

  admins.get('kim')

  .then(t.fail.bind(null, '.get("kim") must fail after init'))

  .catch(function (error) {
    t.is(error.name, 'not_found', '.get("kim") fails with not_found')
  })

  .then(function () {
    return admins.set('kim', 'secret')
  })

  .then(function () {
    t.pass('sets admin "kim" with password "secret"')

    return admins.get('kim')
  })

  .then(function (doc) {
    t.is(doc._id, 'org.couchdb.user:kim', 'resolves with doc._id = "org.couchdb.user:kim"')
    t.is(doc.type, 'user', 'resolves with doc.type = "user"')
    t.is(doc.name, 'kim', 'resolves with doc.name = "kim"')
    t.is(doc.password_scheme, 'pbkdf2', 'resolves with doc.password_scheme = "pbkdf2"')
    t.is(typeof doc.derived_key, 'string', 'resolves with doc.derived_key')
    t.is(typeof doc.salt, 'string', 'resolves with doc.salt')
    t.is(doc.iterations, 10, 'resolves with doc.iterations = 10')

    return admins.validatePassword('foo', 'secret')
  })

  .catch(function (error) {
    t.is(error.name, 'not_found', '.validatePassword("foo", "secret") fails with not_found')

    return admins.validatePassword('kim', 'wrongsecret')
  })

  .catch(function (error) {
    t.is(error.name, 'unauthorized', '.validatePassword("kim", "wrongsecret") fails with unauthorized')

    return admins.validatePassword('kim', 'secret')
  })

  .then(function () {
    t.is(arguments[0], undefined, '.validatePassword("kim", "secret") resolves without aragument')

    return admins.calculateSessionId('kim', 14 * 24 * 60 * 60 * 1000)
  })

  .then(function (sessionId) {
    t.is(typeof sessionId, 'string', '.calculateSessionId("kim") resolves with sessionId')

    return admins.validateSession(sessionId)
  })

  .then(function () {
    t.is(arguments[0], undefined, '.validateSession() resolves without argument')
  })

  .catch(t.error)

  .then(function () {
    preinitializedAdmins = db.admins({
      secret: 'secretXYZ',
      admins: {
        'foo': '-pbkdf2-209defc26fef24bbbf578735c7dcacdf34c36624,10a1d01b11f617c1e219316d12913313419117b1cd1f6110,10'
      }
    })
    return preinitializedAdmins.get('foo');
  })
  .then(function (doc) {
    t.ok(doc, "fetching preinitialized admins works")
    return preinitializedAdmins.validatePassword('foo', 'mysecret')
  })
  .catch(function (error) {
    t.fail(error, "trying to retrieve a preinitialized admin should not error")
  })
  .then(function () {
    t.is(arguments[0], undefined, 'validating password of preinitialized admin resolves without argument')
  })
  .catch(function () {
    t.fail("trying to validate the password of a preinitialized admin should not error")
  })
})
