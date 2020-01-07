const {assert, boolean, property} = require('fast-check')
const unicodeStringJsonObjectListFixedLength = require('../shared/unicodeStringJsonObjectListFixedLength')
const {dsv: marshallerFactory} = require('./dsv')

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