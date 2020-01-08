const {array, base64, integer, unicodeString} = require('fast-check')

module.exports = (blacklist, minLen = 1) => {
  return integer(minLen, 20).chain(len =>
    array(base64(), len, len).chain(keys => {
      const _keys = keys.map(skipChars(blacklist))
      
      return array(array(unicodeString(1, 20), len, len), minLen, 20).map(valuesList =>
        valuesList
        .map(values => {
          const _values = values.map(skipChars(blacklist))
          
          return (
            _keys
            .map((key, i) => ({[key + i]: _values[i]}))
            .reduce((acc, json) => Object.assign(acc, json), {})
          )
        })
      )
    })
  )
}

function skipChars (blacklist) {
  return string => {
    let str = ''
    for (let at = 0; at < string.length; at++) {
      const ch = string[at]
      if (blacklist.indexOf(ch) === -1) str += ch
    }
    return str || ' '
  }
}