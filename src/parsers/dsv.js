const handleMissingOption = require('../shared/handleMissingOption')

module.exports = {
  name: 'dsv',
  desc: (
    'is a delimiter-separated values parser:\n\n' +
    '--pdelimiter, --delimiter, -D [char]\nDelimiter used to separate values.\n\n' +
    '--pquote, --quote, -Q [char]\nCharacter used to quote strings.\n\n' +
    '--pescape, --escape, -C [char]\nCharacter used to escape quote in strings.\n\n' +
    '--pheader, --header, -H [string]\nProvide a custom header as a JSON array string.\n\n' +
    '--pskip-header, --skip-header, -S [boolean]\nDo not interpret first line as header.\n\n' +
    '--pfixed-length, --fixed-length, -F [boolean]\nPost-processing #1: Controls, whether each line has the same number of values. Ignores all deviating lines while reporting errors.\n\n' +
    '--pskip-empty-values, --skip-empty-values, -E [boolean]\nPost-processing #2: Skip values that are empty strings.\n\n' +
    '--ptrim-whitespaces, --trim-whitespaces, -W [boolean]\nPost-processing #3: Trim whitespaces around values.\n\n' +
    '--pempty-as-null, --empty-as-null, -I [boolean]\nPost-processing #4: Treat empty fields as null.\n\n' +
    '--pskip-null, --skip-null, -N [boolean]\nPost-processing #5: Skip values that are null.\n\n' +
    '--pmissing-as-null, --missing-as-null, -M [boolean]\nPost-processing #6: Treat missing fields (if #values < #keys) as null.\n'
  ),
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return argv => {
    const {
      verbose,
      pdelimiter,       delimiter,       D,
      pquote,           quote,           Q,
      pescape,          escape,          C,
      pheader,          header,          H,
      pskipHeader,      skipHeader,      S,
      pfixedLength,     fixedLength,     F,
      pskipEmptyValues, skipEmptyValues, E,
      ptrimWhitespaces, trimWhitespaces, W,
      pemptyAsNull,     emptyAsNull,     I,
      pskipNull,        skipNull,        N,
      pmissingAsNull,   missingAsNull,   M
    } = argv

    const _delimiter       = pdelimiter       || delimiter       || D || defaults.delimiter
    const _quote           = pquote           || quote           || Q || defaults.quote
    const _escape          = pescape          || escape          || C || defaults.escape
    const _header          = pheader          || header          || H || defaults.header
    const _skipHeader      = pskipHeader      || skipHeader      || S || defaults.skipHeader      || false
    const _fixedLength     = pfixedLength     || fixedLength     || F || defaults.fixedLength     || false
    const _skipEmptyValues = pskipEmptyValues || skipEmptyValues || E || defaults.skipEmptyValues || false
    const _trimWhitespaces = ptrimWhitespaces || trimWhitespaces || W || defaults.trimWhitespaces || false
    const _emptyAsNull     = pemptyAsNull     || emptyAsNull     || I || defaults.emptyAsNull     || false
    const _skipNull        = pskipNull        || skipNull        || N || defaults.skipNull        || false
    const _missingAsNull   = pmissingAsNull   || missingAsNull   || M || defaults.missingAsNull   || false
  
    const missingOptions = [
      handleMissingOption(_delimiter, 'pdelimiter, delimiter or D', argv),
      handleMissingOption(_quote,     'pquote, quote or Q',         argv),
      handleMissingOption(_escape,    'pescape, escape or C',       argv),
      handleMissingOption(_header,    'pheader, header or H',       argv)
    ]
    let err = []
    for (let i = 0; i < missingOptions.length; i++) {
      const errs = missingOptions[i]
      err = err.concat(errs)
    }
    if (err.length > 0) return () => ({err, jsons: []})

    let keys               = JSON.parse(_header)
    let keysLength         = keys.length

    // skipHeader | header || return type | keys            | data header   || headerIsSet | ignoreDataHeader | returnTypeObject
    // true       | [...]  || JSON object | provided header | ignore        || true        | true             | true
    // true       | []     || JSON array  | none            | ignore        || true        | true             | false
    // false      | [...]  || JSON object | provided header | treat as data || true        | false            | true
    // false      | []     || JSON object | data header     | treat as keys || false       | false            | true

    let headerIsSet        =  _skipHeader || keysLength > 0
    let ignoreDataHeader   =  _skipHeader
    const returnTypeObject = !_skipHeader || keysLength > 0

    const postprocessingFs = []
    if (_fixedLength)     postprocessingFs.push(controlFixedLength)
    if (_skipEmptyValues) postprocessingFs.push(removeEmptyValues)
    if (_trimWhitespaces) postprocessingFs.push(removeWhitespaces)
    if (_emptyAsNull)     postprocessingFs.push(emptyToNull)
    if (_skipNull)        postprocessingFs.push(removeNulls)
    if (_missingAsNull)   postprocessingFs.push(missingToNull)

    const postprocessingF = (values, line) => {
      let err     = []
      let values2 = values

      for (let i = 0; i < postprocessingFs.length; i++) {
        const f   = postprocessingFs[i]
        const res = f(values2, line)
        if (res.err.length > 0) err = err.concat(res.err)
        values2   = res.values
      }

      return {err, values: values2}
    }

    return (tokens, lines) => {
      let err       = []
      const jsons   = []

      const start   = ignoreDataHeader ? 1 : 0

      for (let i = start; i < tokens.length; i++) {
        const token = tokens[i]
        
        let values  = []
        let from    = 0

        let inQuote          = false
        let mayBeEscaped     = false
        let isEscaped        = false
        let valueFound       = false
        let hasQuotes        = false
        let hasEscapedQuotes = false

        for (let at = 0; at < (token || '').length; at++) {
          const ch  = token.charAt(at)

          if (inQuote) {
                                        hasQuotes        = true
            if (_quote === _escape) {
              if (mayBeEscaped) {
                                        mayBeEscaped     = false
                if (ch === _quote)      hasEscapedQuotes = true
                else                    inQuote          = false
                if (ch === _delimiter)  valueFound       = true
              } else {
                if (ch === _escape)     mayBeEscaped     = true
                else if (ch === _quote) inQuote          = false
              }
            } else {
              if (isEscaped) {
                                        isEscaped        = false
                if (ch === _quote)      hasEscapedQuotes = true
              } else {
                if (ch === _escape)     isEscaped        = true
                else if (ch === _quote) inQuote          = false
              }
            }
          } else {
            if (ch === _quote)          inQuote          = true
            else if (ch === _delimiter) valueFound       = true
          }

          if (valueFound || at === token.length - 1) {
            let value  = token.slice(from, valueFound ? at : at + 1)
            valueFound = false
            from       = at + 1

            if (hasQuotes)        value = removeQuotes(value)
            if (hasEscapedQuotes) value = removeEscapedQuotes(value)

            values.push(value)
          }

          if (at === token.length - 1 && ch === _delimiter) {
            values.push('')
          }
        }

        if (token === '') values.push(token)

        if (keysLength === 0 && !returnTypeObject) {
          keysLength = values.length
        }

        const line = verbose > 0 ? lines[i] : undefined
        const res  = postprocessingF(values, line)
        if (res.err.length > 0) err = err.concat(res.err)
        values     = res.values

        if (values.length > 0) {
          if (!headerIsSet) {
            keys             = values
            keysLength       = keys.length
            headerIsSet      = true
            ignoreDataHeader = false
          } else if (returnTypeObject) {
            const json    = {}
            
            const until   = Math.min(keysLength, values.length)
  
            for (let j = 0; j < until; j++) {
              const key   = keys[j]
              const value = values[j]
              json[key]   = value
            }
  
            jsons.push(json)
          } else {
            jsons.push(values)
          }
        }
      }

      return {err, jsons}
    }

    function removeQuotes (value) {
      let value2 = value
      const len  = value.length
      if (len > 0 && value[0] === _quote && value[len - 1] === _quote) {
        value2   = value.slice(1, len - 1)
      }
      return value2
    }

    function removeEscapedQuotes (value) {
      let lastCh  = ''
      let value2  = ''
      for (let at = 0; at < value.length; at++) {
        const ch  = value[at]
        if (lastCh === '') {
          lastCh  = ch
        } else if (lastCh === _escape && ch === _quote) {
          value2 += ch
          lastCh  = ''
        } else {
          value2 += lastCh
          lastCh  = ch
        }
      }
      value2     += lastCh
      return value2
    }

    function controlFixedLength (values, lineNo) {
      if (headerIsSet && keysLength !== values.length) {
        const msg  = {msg: 'Number of values does not match number of headers'}
        const line = verbose > 0 ? {line: lineNo}                                                         : {}
        const info = verbose > 1 ? {info: `values [${values.join(',')}] and headers [${keys.join(',')}]`} : {}
        return {err: [Object.assign(msg, line, info)], values: []}
      } else {
        return {err: [], values}
      }
    }
    
    function removeWhitespaces (values) {
      let values2    = []
      for (let i = 0; i < values.length; i++) {
        const value  = values[i]
        const value2 = value.replace(/^\s+|\s+$/g, '')
        values2.push(value2)
      }
      return {err: [], values: values2}
    }

    function removeEmptyValues (values) {
      const values2 = []
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value !== '') values2.push(value)
      }
      return {err: [], values: values2}
    }
    
    function emptyToNull (values) {
      const values2 = []
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        values2.push(value === '' ? null : value)
      }
      return {err: [], values: values2}
    }

    function removeNulls (values) {
      const values2 = []
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value !== null) values2.push(value)
      }
      return {err: [], values: values2}
    }
    
    function missingToNull (values) {
      if (headerIsSet) {
        const len     = values.length
        const values2 = []
        for (let i = 0; i < keysLength; i++) {
          const value = i < len ? values[i] : null
          values2.push(value)
        }
        return {err: [], values: values2}
      } else {
        return {err: [], values}
      }
    }
  }
}