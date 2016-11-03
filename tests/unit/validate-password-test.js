var simple = require('simple-mock')
var test = require('tape')

var rewire = require('rewire')
var validatePassword = rewire('../../lib/validate-password')

var getAdminStub = simple.stub()

test('validate-password', function (group) {
  group.test('when pbkdf2 errors', function(t) {
    t.plan(1)


    validatePassword.__with__({
      getAdmin: getAdminStub
    })(function () {
      getAdminStub.resolveWith({
        salt: 'im-salty'
      })
      var error = new Error('pbkdf2 error')
      simple.mock(validatePassword.__get__('crypto'), 'pbkdf2')
        .callbackAtIndex(4, error)

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
  })

  group.end()
})
