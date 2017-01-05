var simple = require('simple-mock')
var test = require('tape')
var proxyquire = require('proxyquire').noCallThru().noPreserveCache()

test('hash-password', function (group) {
  group.test('when pbkdf2 errors', function(t) {
    var pbkdf2Stub = simple.stub()
    var callbackStub = simple.stub()

    var hashPassword = proxyquire('../../../lib/utils/hash-password', {
      crypto: {
        pbkdf2: pbkdf2Stub
      }
    })

    t.plan(3)

    var error = new Error('pbkdf2 error')
    pbkdf2Stub.callbackAtIndex(5, error)

    t.doesNotThrow(function () {
      hashPassword('password', 'salt', 10, callbackStub)
    }, error, "does not throw the pbkdf2 error")

    t.equal(callbackStub.callCount, 1, "calls the callback once only")
    t.equal(callbackStub.lastCall.args[0], error, "with the error returned from pbkdf2")
  })

  group.end()
})
