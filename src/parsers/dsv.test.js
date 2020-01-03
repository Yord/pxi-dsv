const {anything, array, assert, base64, constant, integer, oneof, property, unicodeString} = require('fast-check')
const {dsv: parserFactory} = require('./dsv')

const delimiters    = [',', ';', '.', '|', '/', '-', '+', '$', '#', '!'].map(constant)
const quoteOrEscape = ["'", '"', '`', '\\'].map(constant)

test('parses a dsv file without provided header', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          unicodeStringJsonObjectList([delimiter, quote, escape]).map(jsons => {
            const tokens = (
              [Object.keys(jsons[0]).join(delimiter)]
              .concat(jsons.map(json => Object.values(json).join(delimiter)))
            )

            return {
              jsons,
              tokens,
              defaults: {
                delimiter,
                quote,
                escape,
                header:          '[]',
                skipHeader:      false,
                fixedLength:     false,
                trimWhitespaces: false,
                skipEmptyValues: false,
                missingIsNull:   false,
                emptyIsNull:     false
              }
            }
          })
        )
      )
    )
  )
  
  assert(
    property(lines, jsonsTokensDefaults, (lines, {jsons, tokens, defaults}) =>
      expect(
        parserFactory(defaults)(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

test('parses a dsv file with provided header', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    array(base64(), 20, 20).chain(keys =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            unicodeStringJsonObjectList([delimiter, quote, escape]).map(jsons => {
              const _jsons  = (
                [Object.keys(jsons[0]).reduce((acc, key, i) => ({...acc, [keys[i]]: key}), {})]
                .concat(
                  jsons.map(json =>
                    Object.values(json).reduce((acc, value, i) => ({...acc, [keys[i]]: value}), {})
                  )
                )
              )
              const tokens = (
                [Object.keys(jsons[0]).join(delimiter)]
                .concat(jsons.map(json => Object.values(json).join(delimiter)))
              )
              const header = '[' + keys.map(key => '"' + key + '"').join(',') + ']'
  
              return {
                jsons: _jsons,
                tokens,
                defaults: {
                  delimiter,
                  quote,
                  escape,
                  header,
                  skipHeader:      false,
                  fixedLength:     false,
                  trimWhitespaces: false,
                  skipEmptyValues: false,
                  missingIsNull:   false,
                  emptyIsNull:     false
                }
              }
            })
          )
        )
      )
    )
  )
  
  assert(
    property(lines, jsonsTokensDefaults, (lines, {jsons, tokens, defaults}) =>
      expect(
        parserFactory(defaults)(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

function unicodeStringJsonObjectList (blacklist) {
  return integer(1, 20).chain(len =>
    array(base64(), len, len).chain(keys => {
      const _keys = keys.map(skipChars(blacklist))
      
      return array(array(unicodeString(1, 20), len, len), 1, 20).map(valuesList =>
        valuesList
        .map(values => {
          const _values = values.map(skipChars(blacklist))
          
          return (
            _keys
            .map((key, i) => ({[key]: _values[i]}))
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