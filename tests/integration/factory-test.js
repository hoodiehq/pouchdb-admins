var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-memory'))
var test = require('tape')

var plugin = require('../../index')

test('db.admins({secret: "secret123"})', function (t) {
  t.plan(20)

  PouchDB.plugin(plugin)
  var db = new PouchDB('foo')
  t.is(typeof db.admins, 'function', 'db.admins is a function')

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
})
