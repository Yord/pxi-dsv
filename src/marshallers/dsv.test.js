const {array, assert, base64, boolean, constant, integer, oneof, property} = require('fast-check')
const unicodeStringJsonObjectListFixedLength = require('../shared/unicodeStringJsonObjectListFixedLength')
const {dsv: marshallerFactory} = require('./dsv')

const recordSeparators = ['\n', '\r\n', '|', '@'].map(constant)
const delimiters       = [',', ';', '.', '/', '-', '+', '$', '#', '!'].map(constant)
const quoteOrEscape    = ["'", '"', '`', '\\'].map(constant)

test('marshals a dsv file with missing options and verbose 0', () => {
  const argv                = {verbose: 0}

  const err                 = [
    {msg: 'Please provide mrecordSeparator, recordSeparator or R option'},
    {msg: 'Please provide mdelimiter, delimiter or D option'},
    {msg: 'Please provide mquote, quote or Q option'},
    {msg: 'Please provide mescape, escape or C option'},
    {msg: 'Please provide mheader, header or H option'}
  ]

  const jsonsTokensDefaults = (
    boolean().chain(fixedLength =>
      unicodeStringJsonObjectListFixedLength([]).map(jsons => {
        const str = ''

        return {
          jsons,
          str,
          defaults: {
            skipHeader:      false,
            fixedLength,
            trimWhitespaces: false,
            skipEmptyValues: false,
            missingAsNull:   false,
            emptyAsNull:     false,
            skipNull:        false
          }
        }
      })
    )
  )
  
  assert(
    property(jsonsTokensDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('marshals a dsv file with missing options and verbose 1', () => {
  const argv                = {verbose: 1}

  const err                 = [
    {msg: 'Please provide mrecordSeparator, recordSeparator or R option', line: -1},
    {msg: 'Please provide mdelimiter, delimiter or D option',             line: -1},
    {msg: 'Please provide mquote, quote or Q option',                     line: -1},
    {msg: 'Please provide mescape, escape or C option',                   line: -1},
    {msg: 'Please provide mheader, header or H option',                   line: -1}
  ]

  const jsonsStrDefaults = (
    boolean().chain(fixedLength =>
      unicodeStringJsonObjectListFixedLength([]).map(jsons => {
        const str = ''

        return {
          jsons,
          str,
          defaults: {
            skipHeader:      false,
            fixedLength,
            trimWhitespaces: false,
            skipEmptyValues: false,
            missingAsNull:   false,
            emptyAsNull:     false,
            skipNull:        false
          }
        }
      })
    )
  )
  
  assert(
    property(jsonsStrDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('marshals a dsv file with missing options and verbose 2', () => {
  const argv                = {verbose: 2}

  const err                 = [
    {msg: 'Please provide mrecordSeparator, recordSeparator or R option', line: -1, info: JSON.stringify(argv)},
    {msg: 'Please provide mdelimiter, delimiter or D option',             line: -1, info: JSON.stringify(argv)},
    {msg: 'Please provide mquote, quote or Q option',                     line: -1, info: JSON.stringify(argv)},
    {msg: 'Please provide mescape, escape or C option',                   line: -1, info: JSON.stringify(argv)},
    {msg: 'Please provide mheader, header or H option',                   line: -1, info: JSON.stringify(argv)}
  ]

  const jsonsStrDefaults = (
    boolean().chain(fixedLength =>
      unicodeStringJsonObjectListFixedLength([]).map(jsons => {
        const str = ''

        return {
          jsons,
          str,
          defaults: {
            skipHeader:      false,
            fixedLength,
            trimWhitespaces: false,
            skipEmptyValues: false,
            missingAsNull:   false,
            emptyAsNull:     false,
            skipNull:        false
          }
        }
      })
    )
  )
  
  assert(
    property(jsonsStrDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('marshalls a dsv file without provided header', () => {
  const err                 = []

  const argv                = {verbose: 0}

  const jsonsStrDefaults = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
                const str = (
                  [Object.keys(jsons[0]).join(delimiter)]
                  .concat(jsons.map(json => Object.values(json).join(delimiter)))
                  .join(recordSeparator) + recordSeparator
                )

                return {
                  jsons,
                  str,
                  defaults: {
                    recordSeparator,
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    skipHeader:      false,
                    fixedLength,
                    trimWhitespaces: false,
                    skipEmptyValues: false,
                    missingAsNull:   false,
                    emptyAsNull:     false,
                    skipNull:        false
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
    property(jsonsStrDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('marshalls a dsv file with provided header', () => {
  const err                 = []

  const argv                = {verbose: 0}

  const jsonsStrDefaults = (
    oneof(...recordSeparators).chain(recordSeparator =>
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
                  const str = (
                    [keys.join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  )
                  const header = '[' + keys.map(key => '"' + key + '"').join(',') + ']'
      
                  return {
                    jsons: _jsons,
                    str,
                    defaults: {
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header,
                      skipHeader:      false,
                      fixedLength,
                      trimWhitespaces: false,
                      skipEmptyValues: false,
                      missingAsNull:   false,
                      emptyAsNull:     false,
                      skipNull:        false
                    }
                  }
                })
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('marshalls a dsv file with provided header and skipHeader', () => {
  const err                 = []

  const argv                = {verbose: 0}

  const jsonsStrDefaults = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons => {
                const len = Object.keys(jsons[0]).length

                return array(base64(), len, len).map(keys => {
                  const _jsons = jsons.map(json =>
                    Object.values(json).reduce((acc, value, i) => ({...acc, [keys[i]]: value}), {})
                  )
                  const str = (
                    _jsons.map(json => Object.values(json).join(delimiter))
                    .join(recordSeparator) + recordSeparator
                  )
                  const header = '[' + keys.map(key => '"' + key + '"').join(',') + ']'
      
                  return {
                    jsons: _jsons,
                    str,
                    defaults: {
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header,
                      skipHeader:      true,
                      fixedLength,
                      trimWhitespaces: false,
                      skipEmptyValues: false,
                      missingAsNull:   false,
                      emptyAsNull:     false,
                      skipNull:        false
                    }
                  }
                })
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('marshalls a dsv file without provided header and skipHeader', () => {
  const err                 = []

  const argv                = {verbose: 0}

  const jsonsStrDefaults = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
                const _jsons  = jsons.map(json => Object.values(json))
                const str = (
                  _jsons.map(json => Object.values(json).join(delimiter))
                  .join(recordSeparator) + recordSeparator
                )
    
                return {
                  jsons: _jsons,
                  str,
                  defaults: {
                    recordSeparator,
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    skipHeader:      true,
                    fixedLength,
                    trimWhitespaces: false,
                    skipEmptyValues: false,
                    missingAsNull:   false,
                    emptyAsNull:     false,
                    skipNull:        false
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
    property(jsonsStrDefaults, ({jsons, str, defaults}) =>
      expect(
        marshallerFactory(defaults)(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})