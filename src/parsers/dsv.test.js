const {anything, array, assert, base64, boolean, constant, integer, oneof, property, unicodeString} = require('fast-check')
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
          boolean().chain(fixedLength =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
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
                  fixedLength,
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

test('parses a dsv file with provided header', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          boolean().chain(fixedLength =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons => {
              const len = Object.keys(jsons[0]).length

              return array(base64(), len, len).map(keys => {
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
                    fixedLength,
                    trimWhitespaces: false,
                    skipEmptyValues: false,
                    missingIsNull:   false,
                    emptyIsNull:     false
                  }
                }
              })
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

test('parses a dsv file with provided header and skipHeader', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          boolean().chain(fixedLength =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons => {
              const len = Object.keys(jsons[0]).length

              return array(base64(), len, len).map(keys => {
                const _jsons  = jsons.map(json =>
                  Object.values(json).reduce((acc, value, i) => ({...acc, [keys[i]]: value}), {})
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
                    skipHeader:      true,
                    fixedLength,
                    trimWhitespaces: false,
                    skipEmptyValues: false,
                    missingIsNull:   false,
                    emptyIsNull:     false
                  }
                }
              })
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

test('parses a dsv file without provided header and skipHeader', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          boolean().chain(fixedLength =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
              const _jsons  = jsons.map(json => Object.values(json))
              const tokens = (
                [Object.keys(jsons[0]).join(delimiter)]
                .concat(jsons.map(json => Object.values(json).join(delimiter)))
              )
  
              return {
                jsons: _jsons,
                tokens,
                defaults: {
                  delimiter,
                  quote,
                  escape,
                  header:          '[]',
                  skipHeader:      true,
                  fixedLength,
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

test('parses a dsv file with variable values lengths and the fixed length option', () => {
  const argv  = {verbose: 0}
  const lines = anything()

  const jsonsTokensDefaultsErr = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
            integer(0, jsons.length - 1).map(noOfDeletes => {
              const tokens = noOfDeletes === 0 ? (
                [Object.keys(jsons[0]).join(delimiter)]
                .concat(jsons.map(json => Object.values(json).join(delimiter)))
              ) : (
                [Object.keys(jsons[0]).join(delimiter)]
                .concat(
                  jsons.slice(0, noOfDeletes).map(json => Object.values(json).slice(1).join(delimiter))
                )
                .concat(
                  jsons.slice(noOfDeletes).map(json => Object.values(json).join(delimiter))
                )
              )
              const _jsons = jsons.slice(noOfDeletes, jsons.length)

              const err = []
              for (let i = 0; i < noOfDeletes; i++) {
                const msg = {msg: 'Number of values does not match number of headers'}
                err.push(msg)
              }
  
              return {
                noOfDeletes,
                err,
                jsons: _jsons,
                tokens,
                defaults: {
                  delimiter,
                  quote,
                  escape,
                  header:          '[]',
                  skipHeader:      false,
                  fixedLength:     true,
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
    property(lines, jsonsTokensDefaultsErr, (lines, {jsons, tokens, defaults, err}) =>
      expect(
        parserFactory(defaults)(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

test('parses a dsv file with variable values lengths and the fixed length option with lines', () => {
  const argv  = {verbose: 1}

  const jsonsTokensDefaultsErrLines = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
            integer().chain(lineOffset =>
              integer(0, jsons.length - 1).map(noOfDeletes => {
                const tokens = noOfDeletes === 0 ? (
                  [Object.keys(jsons[0]).join(delimiter)]
                  .concat(jsons.map(json => Object.values(json).join(delimiter)))
                ) : (
                  [Object.keys(jsons[0]).join(delimiter)]
                  .concat(
                    jsons.slice(0, noOfDeletes).map(json => Object.values(json).slice(1).join(delimiter))
                  )
                  .concat(
                    jsons.slice(noOfDeletes).map(json => Object.values(json).join(delimiter))
                  )
                )
                const _jsons = jsons.slice(noOfDeletes, jsons.length)
  
                const lines = []
                for (let i = 0; i < tokens.length; i++) lines.push(lineOffset + i)

                const err = []
                for (let i = 0; i < noOfDeletes; i++) {
                  err.push({
                    msg:  'Number of values does not match number of headers',
                    line: lines[i + 1]
                  })
                }
    
                return {
                  noOfDeletes,
                  lines,
                  err,
                  jsons: _jsons,
                  tokens,
                  defaults: {
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    skipHeader:      false,
                    fixedLength:     true,
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
  )
  
  assert(
    property(jsonsTokensDefaultsErrLines, ({jsons, tokens, defaults, err, lines}) =>
      expect(
        parserFactory(defaults)(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

test('parses a dsv file with variable values lengths and the fixed length option with lines and info', () => {
  const argv  = {verbose: 2}

  const jsonsTokensDefaultsErrLines = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
            integer().chain(lineOffset =>
              integer(0, jsons.length - 1).map(noOfDeletes => {
                const tokens = noOfDeletes === 0 ? (
                  [Object.keys(jsons[0]).join(delimiter)]
                  .concat(jsons.map(json => Object.values(json).join(delimiter)))
                ) : (
                  [Object.keys(jsons[0]).join(delimiter)]
                  .concat(
                    jsons.slice(0, noOfDeletes).map(json => Object.values(json).slice(1).join(delimiter))
                  )
                  .concat(
                    jsons.slice(noOfDeletes).map(json => Object.values(json).join(delimiter))
                  )
                )
                const _jsons = jsons.slice(noOfDeletes, jsons.length)
  
                const lines = []
                for (let i = 0; i < tokens.length; i++) lines.push(lineOffset + i)

                const err = []
                for (let i = 0; i < noOfDeletes; i++) {
                  const values = Object.values(jsons[i]).slice(1)
                  const keys   = Object.keys(jsons[0])
                  err.push({
                    msg:  'Number of values does not match number of headers',
                    line: lines[i + 1],
                    info: `values [${values.join(',')}] and headers [${keys.join(',')}]`
                  })
                }
    
                return {
                  noOfDeletes,
                  lines,
                  err,
                  jsons: _jsons,
                  tokens,
                  defaults: {
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    skipHeader:      false,
                    fixedLength:     true,
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
  )
  
  assert(
    property(jsonsTokensDefaultsErrLines, ({jsons, tokens, defaults, err, lines}) =>
      expect(
        parserFactory(defaults)(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

test('parses a dsv file and trim whitespaces', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          boolean().chain(fixedLength =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons =>
              whitespace().map(ws => {
                const _jsons = jsons.map(json => {
                  const r = new RegExp(['\u0020', '\u00A0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u205F', '\u3000'].join('|'), 'g')
                  return Object.keys(json).reduce(
                    (acc, key) => ({...acc, [key.replace(r, '')]: json[key].replace(r, '')}),
                    {}
                  )
                })

                const tokens = (
                  [Object.keys(_jsons[0]).map(key => ws + key + ws).join(delimiter)]
                  .concat(_jsons.map(json => Object.values(json).map(value => ws + value + ws).join(delimiter)))
                )

                return {
                  jsons: _jsons,
                  tokens,
                  defaults: {
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    skipHeader:      false,
                    fixedLength,
                    trimWhitespaces: true,
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

test('parses a dsv file and skip empty values', () => {
  const err                 = []

  const argv                = {verbose: 0}
  const lines               = anything()

  const jsonsTokensDefaults = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          boolean().chain(fixedLength =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
              const tokens = (
                [Object.keys(jsons[0]).join(delimiter)]
                .concat(jsons.map(json => Object.values(json).map(value => value === '' ? ' ' : value).join(delimiter)))
                .concat(jsons.map(json => Object.values(json).map(() => '').join(delimiter)))
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
                  fixedLength,
                  trimWhitespaces: false,
                  skipEmptyValues: true,
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

test('parses a dsv file and convert empty values to nulls', () => {
  const argv  = {verbose: 0}
  const lines = anything()

  const jsonsTokensDefaultsErr = (
    oneof(...delimiters).chain(delimiter =>
      oneof(...quoteOrEscape).chain(quote =>
        oneof(...quoteOrEscape).chain(escape =>
          unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
            integer(0, jsons.length - 1).map(noOfNulls => {
              const err = []

              const _jsons = noOfNulls === 0 ? (
                jsons
              ) : (
                jsons
                .slice(0, noOfNulls)
                .map(json =>
                  Object.keys(json)
                  .reduce((acc, key) => ({...acc, [key]: null}), {})
                )
                .concat(jsons.slice(noOfNulls))
              )

              const tokens = noOfNulls === 0 ? (
                [Object.keys(_jsons[0]).join(delimiter)]
                .concat(_jsons.map(json => Object.values(json).join(delimiter)))
              ) : (
                [Object.keys(_jsons[0]).join(delimiter)]
                .concat(
                  _jsons.slice(0, noOfNulls).map(json => Object.values(json).map(() => '').join(delimiter))
                )
                .concat(
                  _jsons.slice(noOfNulls).map(json => Object.values(json).join(delimiter))
                )
              )
              
              return {
                noOfNulls,
                err,
                jsons: _jsons,
                tokens,
                defaults: {
                  delimiter,
                  quote,
                  escape,
                  header:          '[]',
                  skipHeader:      false,
                  fixedLength:     true,
                  trimWhitespaces: false,
                  skipEmptyValues: false,
                  missingIsNull:   false,
                  emptyIsNull:     true
                }
              }
            })
          )
        )
      )
    )
  )
  
  assert(
    property(lines, jsonsTokensDefaultsErr, (lines, {jsons, tokens, defaults, err}) =>
      expect(
        parserFactory(defaults)(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    )
  )
})

function unicodeStringJsonObjectListFixedLength (blacklist, minLen = 1) {
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

function whitespace () {
  return oneof(
    ...['\u0020', '\u00A0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u205F', '\u3000']
    .map(constant)
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