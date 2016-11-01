var simple = require('simple-mock')
var test = require('tape')
var format = require('util').format

var set = require('../../lib/set')
var internals = set.internals

test('set', function (group) {
  var state = {admins: {}}
  var username = 'admin'
  var password = 'secret'

  group.test('when hashPassword errors', function(t) {
    t.plan(1)

    simple.mock(internals, 'hashPassword').callbackWith(new Error('hashPassword error'))

    set(state, username, password)

      .then(function () {
        t.error('Should reject')
      })

      .catch(function (error) {
        t.is(error.message, 'hashPassword error', 'rejects with error from hashPassword')
      })

    simple.restore()
  })

  group.test('when hashPassword succeeds', function(t) {
    t.plan(1)

    var hash = 'mylonghash'
    simple.mock(internals, 'hashPassword').callbackWith(null, hash)

    set(state, username, password)

      .then(function () {
        t.ok((new RegExp(format(
          '^-pbkdf2-%s,[^,]{48},10$',
          hash
        ))).test(state.admins[username]), 'resolves with salted hash string')
      })

      .catch(function (error) {
        t.error('Should succeed')
      })

    simple.restore()
  })

  group.end()
})
