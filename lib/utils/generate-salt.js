module.exports = generateSalt

var secureRandom = require('secure-random')

function generateSalt () {
  var array = secureRandom(16)
  return arrayToString(array)
}

function arrayToString (array) {
  var result = ''
  for (var i = 0; i < array.length; i += 1) {
    result += ((array[i] & 0xFF) + 0x100).toString(16)
  }
  return result
}
