var simple = require('simple-mock')
var test = require('tape')
var proxyquire = require('proxyquire').noCallThru().noPreserveCache()

test('validate-password', function (group) {
  group.test('when pbkdf2 errors', function(t) {
    var getAdminStub = simple.stub()
    var pbkdf2Stub = simple.stub()

    var validatePassword = proxyquire('../../lib/validate-password', {
      './get': getAdminStub,
      crypto: {
        pbkdf2: pbkdf2Stub
      }
    })

    t.plan(1)

    getAdminStub.resolveWith({
      salt: 'im-salty'
    })
    var error = new Error('pbkdf2 error')
    pbkdf2Stub.callbackAtIndex(5, error)

    validatePassword()
      .then(function () {
        t.fail("should not resolve")
      })
      .catch(function (caughtError) {
        t.equal(caughtError, error, "should reject the returned promise with the error thrown from pbkdf2")
      })
      .then(function () {
        simple.restore()
        getAdminStub.actions = []
      })
  })

  group.end()
})
