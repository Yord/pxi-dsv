const handleMissingOption = require('../shared/handleMissingOption')

module.exports = {
  name: 'dsv',
  desc: (
    'is a delimiter-separated values marshaller:\n\n' +
    '--mrecord-separator, --record-separator, -R [char]\nCharacter used to separate records.\n\n' +
    '--mdelimiter, --delimiter, -D [char]\nDelimiter used to separate values.\n\n' +
    '--mquote, --quote, -Q [char]\nCharacter used to quote strings.\n\n' +
    '--mescape, --escape, -C [char]\nCharacter used to escape quote in strings.\n\n' +
    '--mheader, --header, -H [string]\nProvide a custom header as a JSON array string.\n\n' +
    '--mskip-header, --skip-header, -S [boolean]\nDo not print a header.\n\n' +
    '--mallow-list-values, --allow-list-values, -L [boolean]\nIf this flag is set, lists and objects are allowed in csv values. They are encoded as JSON.\n\n' +
    '--mfixed-length, --fixed-length, -F [boolean]\nPreprocessing #1: Controls, whether each line has the same number of values. Ignores all deviating lines while reporting errors.\n\n' +
    '--mtrim-whitespaces, --trim-whitespaces, -W [boolean]\nPreprocessing #2: Trim whitespaces around values.\n\n' +
    '--mempty-as-null, --empty-as-null, -I [boolean]\nPreprocessing #3: Treat empty fields as null.\n\n' +
    '--mskip-null, --skip-null, -N [boolean]\nPreprocessing #4: Skip values that are null.\n\n' +
    '--mmissing-as, --missing-as, -M [string]\nPreprocessing #5: Treat missing fields (if #values < #keys) as null.\n'
  ),
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return argv => {
    const {
      verbose,
      mrecordSeparator,      recordSeparator,      R,
      mdelimiter,            delimiter,            D,
      mquote,                quote,                Q,
      mescape,               escape,               C,
      mheader,               header,               H,
      mskipHeader,           skipHeader,           S,
      mallowListValues,      allowListValues,      L,
      mfixedLength,          fixedLength,          F,
      mtrimWhitespaces,      trimWhitespaces,      W,
      memptyAsNull,          emptyAsNull,          I,
      mskipNullAndUndefined, skipNullAndUndefined, N,
      mmissingAs,            missingAs,            M
    } = argv

    const _recordSeparator      = mrecordSeparator      || recordSeparator      || R || defaults.recordSeparator
    const _delimiter            = mdelimiter            || delimiter            || D || defaults.delimiter
    const _quote                = mquote                || quote                || Q || defaults.quote
    const _escape               = mescape               || escape               || C || defaults.escape
    const _header               = mheader               || header               || H || defaults.header
    const _skipHeader           = mskipHeader           || skipHeader           || S || defaults.skipHeader           || false
    const _allowListValues      = mallowListValues      || allowListValues      || L || defaults.allowListValues      || false
    const _fixedLength          = mfixedLength          || fixedLength          || F || defaults.fixedLength          || false
    const _trimWhitespaces      = mtrimWhitespaces      || trimWhitespaces      || W || defaults.trimWhitespaces      || false
    const _emptyAsNull          = memptyAsNull          || emptyAsNull          || I || defaults.emptyAsNull          || false
    const _skipNullAndUndefined = mskipNullAndUndefined || skipNullAndUndefined || N || defaults.skipNullAndUndefined || false
    const _missingAs            = mmissingAs            || missingAs            || M || defaults.missingAs            || undefined

    const missingOptions = [
      handleMissingOption(_recordSeparator, 'mrecordSeparator, recordSeparator or R', argv),
      handleMissingOption(_delimiter,       'mdelimiter, delimiter or D',             argv),
      handleMissingOption(_quote,           'mquote, quote or Q',                     argv),
      handleMissingOption(_escape,          'mescape, escape or C',                   argv),
      handleMissingOption(_header,          'mheader, header or H',                   argv)
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
    const fillMissingValues = typeof _missingAs !== 'undefined'

    const preprocessingFs   = []
    if (_trimWhitespaces)      preprocessingFs.push(removeWhitespaces)
    if (_emptyAsNull)          preprocessingFs.push(emptyToNull)
    if (_skipNullAndUndefined) preprocessingFs.push(removeNulls)
    if (fillMissingValues)     preprocessingFs.push(fillUpRecord)

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

        str += record[0]
        for (let i = 1; i < record.length; i++) str += _delimiter + record[i]
        str += _recordSeparator
      }

      return ({err, str})
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
            record.push(json[key] || null)
          }
        }

        const record2 = []

        for (let j = 0; j < record.length; j++) {
          const field = record[j]

          if (typeof field === 'string') {
            // add quotes to records?
            // escape quotes in records?
            record2.push(field)
          } else if (typeof field === 'number') {
            if (Number.isNaN(field)) {
              record2.push('null')
            } else {
              record2.push(field.toString())
            }
          } else if (typeof field === 'boolean') {
            record2.push(field.toString)
          } else if (typeof field === 'undefined') {
            record2.push('null')
          } else if (field === null) {
            record2.push('null')
          } else if (Array.isArray(field)) {
            if (_allowListValues) {
              // in case of string values
              // add quotes to records?
              // escape quotes in records?
            } else {
              const msg  = {msg: 'Arrays are not allowed as fields'}
              const line = verbose > 0 ? {line: -1}                    : {}
              const info = verbose > 1 ? {info: JSON.stringify(field)} : {}
              err.push(Object.assign(msg, line, info))
            }
          } else if (typeof field === 'object') {
            if (_allowListValues) {
              // in case of string values
              // add quotes to records?
              // escape quotes in records?
            } else {
              const msg  = {msg: 'Objects are not allowed as fields'}
              const line = verbose > 0 ? {line: -1}                    : {}
              const info = verbose > 1 ? {info: JSON.stringify(field)} : {}
              err.push(Object.assign(msg, line, info))
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
      return record
    }

    function removeNulls (record) {
      return record
    }

    function fillUpRecord (record) {
      // use _missingAs
      _missingAs

      return record
    }
  }
}