module.exports = decodeSessionId

var base64url = require('base64url')

function decodeSessionId (id) {
  var parts = base64url.decode(id).split(':')
  return {
    username: parts[0],
    timestamp: parseInt(parts[1], 16),
    token: parts[2]
  }
}
