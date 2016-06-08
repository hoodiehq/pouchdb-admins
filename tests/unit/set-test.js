var simple = require('simple-mock')
var test = require('tape')

var set = require('../../lib/set')
var internals = set.internals

test('set', function (t) {
  t.plan(1)

  var state = {}
  var username = 'admin'
  var password = 'secret'

  simple.mock(internals, 'hashPassword').callbackWith(new Error('hashPassword error'))

  set(state, username, password)

  .then(function () {
    t.error('Should reject')
  })

  .catch(function (error) {
    t.is(error.message, 'hashPassword error', 'rejects with error from hashPassword')
  })
})
