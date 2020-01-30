const handleMissingOption = require('../shared/handleMissingOption')

module.exports = {
  name: 'dsv',
  desc: (
    'is a delimiter-separated values serializer:\n\n' +
    '--srecord-separator, --record-separator, -R [char]\nCharacter used to separate records.\n\n' +
    '--sdelimiter, --delimiter, -D [char]\nDelimiter used to separate values.\n\n' +
    '--squote, --quote, -Q [char]\nCharacter used to quote strings.\n\n' +
    '--sescape, --escape, -C [char]\nCharacter used to escape quote in strings.\n\n' +
    '--sheader, --header, -H [string]\nProvide a custom header as a JSON array string.\n\n' +
    '--sskip-header, --skip-header, -S [boolean]\nDo not print a header.\n\n' +
    '--sallow-list-values, --allow-list-values, -L [boolean]\nIf this flag is set, lists and objects are allowed in csv values. They are encoded as JSON.\n\n' +
    '--sfixed-length, --fixed-length, -F [boolean]\nPreprocessing #1: Controls, whether each line has the same number of values. Ignores all deviating lines while reporting errors.\n\n' +
    '--strim-whitespaces, --trim-whitespaces, -W [boolean]\nPreprocessing #2: Trim whitespaces around values.\n\n' +
    '--sempty-as-null, --empty-as-null, -I [boolean]\nPreprocessing #3: Treat empty fields as null.\n\n' +
    '--sskip-null, --skip-null, -N [boolean]\nPreprocessing #4: Skip values that are null.\n\n' +
    '--smissing-as, --missing-as, -M [string]\nPreprocessing #5: Treat missing fields (if #values < #keys) as null.\n'
  ),
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return argv => {
    const {
      verbose,
      srecordSeparator, recordSeparator, R,
      sdelimiter,       delimiter,       D,
      squote,           quote,           Q,
      sescape,          escape,          C,
      sheader,          header,          H,
      sskipHeader,      skipHeader,      S,
      sfixedLength,     fixedLength,     F,
      sallowListValues, allowListValues, L,
      strimWhitespaces, trimWhitespaces, W,
      semptyAsNull,     emptyAsNull,     I,
      sskipNull,        skipNull,        N,
      snullAs,          nullAs,          A
    } = argv

    const _recordSeparator = srecordSeparator || recordSeparator || R || defaults.recordSeparator
    const _delimiter       = sdelimiter       || delimiter       || D || defaults.delimiter
    const _quote           = squote           || quote           || Q || defaults.quote
    const _escape          = sescape          || escape          || C || defaults.escape
    const _header          = sheader          || header          || H || defaults.header
    const _skipHeader      = sskipHeader      || skipHeader      || S || defaults.skipHeader      || false
    const _allowListValues = sallowListValues || allowListValues || L || defaults.allowListValues || false
    const _fixedLength     = sfixedLength     || fixedLength     || F || defaults.fixedLength     || false
    const _trimWhitespaces = strimWhitespaces || trimWhitespaces || W || defaults.trimWhitespaces || false
    const _emptyAsNull     = semptyAsNull     || emptyAsNull     || I || defaults.emptyAsNull     || false
    const _skipNull        = sskipNull        || skipNull        || N || defaults.skipNull        || false
    const _nullAs          = typeof snullAs         !== 'undefined' ? snullAs :
                             typeof nullAs          !== 'undefined' ? nullAs  :
                             typeof A               !== 'undefined' ? A       :
                             typeof defaults.nullAs !== 'undefined' ? defaults.nullAs
                                                                    : undefined

    const missingOptions = [
      handleMissingOption(_recordSeparator, 'srecordSeparator, recordSeparator or R', argv),
      handleMissingOption(_delimiter,       'sdelimiter, delimiter or D',             argv),
      handleMissingOption(_quote,           'squote, quote or Q',                     argv),
      handleMissingOption(_escape,          'sescape, escape or C',                   argv),
      handleMissingOption(_header,          'sheader, header or H',                   argv)
    ]
    let err      = []
    for (let i = 0; i < missingOptions.length; i++) {
      const errs = missingOptions[i]
      err        = err.concat(errs)
    }
    if (err.length > 0) return () => ({err, str: ''})

    let keys                = JSON.parse(_header)

    // skipHeader | header || addProvidedHeader | headerIsSet | ignoreDataHeader
    // true       | [...]  || false             | true        | true
    // true       | []     || false             | true        | true
    // false      | [...]  || true              | false       | false
    // false      | []     || false             | false       | false

    const addProvidedHeader = !_skipHeader && keys.length > 0
    let headerIsSet         = _skipHeader
    const fillMissingValues = typeof _nullAs !== 'undefined'

    const preprocessingFs   = []
    if (_trimWhitespaces)  preprocessingFs.push(removeWhitespaces)
    if (_emptyAsNull)      preprocessingFs.push(emptyToNull)
    if (_skipNull)         preprocessingFs.push(removeNulls)
    if (fillMissingValues) preprocessingFs.push(replaceNulls)

    const preprocessingF = record => {
      let record2 = record
      for (let i = 0; i < preprocessingFs.length; i++) {
        const f   = preprocessingFs[i]
        record2   = f(record2)
      }
      return record2
    }

    return jsons => {
      let err     = []
      let records = []

      if (!headerIsSet && addProvidedHeader) {
        records.push(keys)
        headerIsSet = true
      }

      if (!headerIsSet) {
        if (jsons.length > 0) {
          const json = jsons[0]

          if (Array.isArray(json)) keys = json
          else if (json === null)  keys = []
          else if (typeof json === 'object') {
            keys                        = Object.keys(json)
            records.push(keys)
          } else keys                   = []
        }
        headerIsSet = true
      }

      let res = jsonsToRecords(jsons)
      if (res.err.length > 0) err = err.concat(res.err)
      records = records.concat(res.records)

      if (_fixedLength) {
        res     = controlFixedLength(records)
        if (res.err.length > 0) err = err.concat(res.err)
        records = res.records
      }
      
      let str = ''

      for (let i = 0; i < records.length; i++) {
        let record = records[i]
        record     = preprocessingF(record)

        str += maybeWithQuotes(record[0])
        for (let i = 1; i < record.length; i++) str += _delimiter + maybeWithQuotes(record[i])
        str += _recordSeparator
      }

      return ({err, str})
    }

    function maybeWithQuotes (value) {
      let value2    = value
      let addQuotes = false

      if (value !== null && value.indexOf(_delimiter) > -1) {
        addQuotes   = true
      }
      if (value !== null) {
        let quoteIndex = value.indexOf(_quote)
        while (quoteIndex > -1) {
          addQuotes    = true
          value2       = value2.slice(0, quoteIndex) + _escape + value2.slice(quoteIndex)
          quoteIndex   = value.indexOf(_quote, quoteIndex + 1)
        }
      }

      return addQuotes ? _quote + value2 + _quote : value2
    }

    function jsonsToRecords (jsons) {
      const err     = []
      const records = []
      
      for (let i = 0; i < jsons.length; i++) {
        const json = jsons[i]

        let record = []

        if (Array.isArray(json)) record = json
        else if (typeof json === 'object' && json !== null) {
          const keys = Object.keys(json)

          for (let j = 0; j < keys.length; j++) {
            const key = keys[j]
            const value = json[key]
            record.push(value)
          }
        }

        const record2 = []

        for (let j = 0; j < record.length; j++) {
          const field = record[j]

          if (typeof field === 'string') {
            record2.push(field)
          } else if (typeof field === 'number') {
            if (Number.isNaN(field)) {
              record2.push(null)
            } else {
              record2.push(field.toString())
            }
          } else if (typeof field === 'boolean') {
            record2.push(field.toString())
          } else if (typeof field === 'undefined') {
            record2.push(null)
          } else if (field === null) {
            record2.push(null)
          } else if (Array.isArray(field)) {
            if (_allowListValues) {
              record2.push(JSON.stringify(field))
            } else {
              const msg  = {msg: 'Arrays are not allowed as fields'}
              const line = verbose > 0 ? {line: -1}                    : {}
              const info = verbose > 1 ? {info: JSON.stringify(field)} : {}
              err.push(Object.assign(msg, line, info))
              record2.push(null)
            }
          } else if (typeof field === 'object') {
            if (_allowListValues) {
              record2.push(JSON.stringify(field))
            } else {
              const msg  = {msg: 'Objects are not allowed as fields'}
              const line = verbose > 0 ? {line: -1}                    : {}
              const info = verbose > 1 ? {info: JSON.stringify(field)} : {}
              err.push(Object.assign(msg, line, info))
              record2.push(null)
            }
          } else {
            const msg  = {msg: 'Type not allowed as field'}
            const line = verbose > 0 ? {line: -1}                                      : {}
            const info = verbose > 1 ? {info: `${field.toString()} (${typeof field})`} : {}
            err.push(Object.assign(msg, line, info))
          }
        }

        records.push(record2)
      }

      return {err: [], records}
    }

    function controlFixedLength (records) {
      const err      = []
      const records2 = []

      for (let i = 0; i < records.length; i++) {
        const record = records[i]

        if (keys.length === 0) keys = record

        if (headerIsSet && keys.length !== record.length) {
          const msg  = {msg: 'Number of values does not match number of headers'}
          const line = verbose > 0 ? {line: -1}                                                             : {}
          const info = verbose > 1 ? {info: `values [${record.join(',')}] and headers [${keys.join(',')}]`} : {}
          
          err.push(Object.assign(msg, line, info))
        } else {
          records2.push(record)
        }
      }

      return {err, records: records2}
    }

    function removeWhitespaces (record) {
      const record2 = []
      for (let i = 0; i < record.length; i++) {
        const value  = record[i]
        const value2 = value.replace(/^\s+|\s+$/g, '')
        record2.push(value2)
      }
      return record2
    }

    function emptyToNull (record) {
      const record2 = []
      for (let i = 0; i < record.length; i++) {
        const value  = record[i]
        const value2 = value === '' ? null : value
        record2.push(value2)
      }
      return record2
    }

    function removeNulls (record) {
      const record2 = []
      for (let i = 0; i < record.length; i++) {
        const value = record[i]
        if (value !== null && typeof value !== 'undefined') record2.push(value)
      }
      return record2
    }

    function replaceNulls (record) {
      if (headerIsSet) {
        const record2 = []
        for (let i = 0; i < keys.length; i++) {
          const value = record[i]
          if (value === null || typeof value === 'undefined') record2.push(_nullAs)
          else record2.push(value)
        }
        return record2
      }
      return record
    }
  }
}