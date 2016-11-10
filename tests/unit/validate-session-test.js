var simple = require('simple-mock')
var test = require('tape')
var proxyquire = require('proxyquire').noCallThru().noPreserveCache()

test('validate-session', function (group) {
  group.test('when session does not validate', function(t) {
    var getAdminStub = simple.stub()
    var calculateSessionIdStub = simple.stub()
    var decodeSessionIdStub = simple.stub()

    var unauthorized = new Error("Invalid Session")
    var validateSession = proxyquire('../../lib/validate-session', {
      './get': getAdminStub,
      'couchdb-calculate-session-id': calculateSessionIdStub,
      './utils/couchdb-decode-session-id': decodeSessionIdStub,
      'pouchdb-errors': {UNAUTHORIZED: unauthorized}
    })

    t.plan(1)

    getAdminStub.resolveWith({
      salt: 'im-salty'
    })

    decodeSessionIdStub.returnWith({
      username: 'a-user',
      timestamp: 987654321
    })

    calculateSessionIdStub.returnWith('validSessionId')

    validateSession({}, 'invalidSessionId')
      .then(function () {
        t.fail("should not resolve")
      })
      .catch(function (caughtError) {
        t.equal(caughtError, unauthorized, "should reject the returned promise with pouchdb's UNAUTHORIZED error")
      })
  })

  group.end()
})
