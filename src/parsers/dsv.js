module.exports = {
  name: 'dsv',
  desc: (
    'is a delimiter separated values parser:\n\n' +
    '--pdelimiter, --delimiter, -D [char]\nDelimiter used to separate values.\n\n' +
    '--pquote, --quote, -Q [char]\nCharacter used to quote strings.\n\n' +
    '--pescape, --escape, -C [char]\nCharacter used to escape quote in strings.\n\n' +
    '--pheader, --header, -H [string]\nProvide a custom header as a JSON array string.\n\n' +
    '--pskipHeader, --skipHeader, -S [boolean]\nDo not interpret first line as header\n\n' +
    '--pfixedLength, --fixedLength, -F [boolean]\nWhether each line must have the same number of values.\n\n' +
    '--ptrimWhitespaces, --trimWhitespaces, -W [boolean]\nTrim whitespaces around values.\n\n' +
    '--pskipEmptyValues, --skipEmptyValues, -E [boolean]\nSkip values that are the empty String.\n\n' +
    '--pmissingIsNull, --missingIsNull, -M [boolean]\nTreat missing fields (if #values < #keys) as null.\n\n' +
    '--pemptyIsNull, --emptyIsNull, -N [boolean]\nTreat empty fields (not empty String!) as null.\n'
  ),
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return (argv) => {
    const {
      verbose,
      pdelimiter,       delimiter,       D,
      pquote,           quote,           Q,
      pescape,          escape,          C,
      pheader,          header,          H,
      pskipHeader,      skipHeader,      S,
      pfixedLength,     fixedLength,     F,
      ptrimWhitespaces, trimWhitespaces, W,
      pskipEmptyValues, skipEmptyValues, E,
      pmissingIsNull,   missingIsNull,   M,
      pemptyIsNull,     emptyIsNull,     N
    } = argv

    const _delimiter       = pdelimiter       || delimiter       || D || defaults.delimiter
    const _quote           = pquote           || quote           || Q || defaults.quote
    const _escape          = pescape          || escape          || C || defaults.escape
    const _header          = pheader          || header          || H || defaults.header
    const _skipHeader      = pskipHeader      || skipHeader      || S || defaults.skipHeader      || false
    const _fixedLength     = pfixedLength     || fixedLength     || F || defaults.fixedLength     || false
    const _trimWhitespaces = ptrimWhitespaces || trimWhitespaces || W || defaults.trimWhitespaces || false
    const _skipEmptyValues = pskipEmptyValues || skipEmptyValues || E || defaults.skipEmptyValues || false
    const _missingIsNull   = pmissingIsNull   || missingIsNull   || M || defaults.missingIsNull   || false
    const _emptyIsNull     = pemptyIsNull     || emptyIsNull     || N || defaults.emptyIsNull     || false
  
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

    const postProcessingFs = []
    if (_fixedLength)     postProcessingFs.push(controlFixedLength)
    if (_trimWhitespaces) postProcessingFs.push(removeWhitespaces(verbose))
    if (_skipEmptyValues) postProcessingFs.push(removeEmptyValues(verbose))
    if (_emptyIsNull)     postProcessingFs.push(emptyToNull(verbose))
    if (_missingIsNull)   postProcessingFs.push(missingToNull(verbose))

    const postProcessingF = (values, line) => {
      let err     = []
      let values2 = values

      for (let i = 0; i < postProcessingFs.length; i++) {
        const f   = postProcessingFs[i]
        const res = f(values, line)
        if (res.err.length > 0) {
          err     = err.concat(res.err)
          break
        }
        else values2 = res.values
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

        let inQuote      = false
        let mayBeEscaped = false
        let isEscaped    = false
        let valueFound   = false

        for (let at = 0; at < token.length; at++) {
          const ch  = token.charAt(at)

          if (inQuote) {
            if (_quote === _escape) {
              if (mayBeEscaped) {
                                        mayBeEscaped = false
                if (ch !== _escape)     inQuote      = false
                if (ch === _delimiter)  valueFound   = true
              } else {
                if (ch === _escape)     mayBeEscaped = true
                else if (ch === _quote) inQuote      = false
              }
            } else {
              if (!isEscaped) {
                if (ch === _escape)     isEscaped    = true
                else if (ch === _quote) inQuote      = false
              }
            }
          } else {
            if (ch === _quote)          inQuote      = true
            else if (ch === _delimiter) valueFound   = true
          }

          if (valueFound) {
            valueFound  = false
            const value = token.slice(from, at)
            values.push(value)
            from        = at + 1
          }

          if (at === token.length - 1) {
            const value = token.slice(from)
            values.push(value)
          }
        }

        if (keysLength === 0 && !returnTypeObject) {
          keysLength = values.length
        }

        const line = verbose > 0 ? lines[i] : undefined
        const {err: e, values: values2} = postProcessingF(values, line)
        if (e.length > 0) err           = err.concat(e)
        else              values        = values2

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

      return {err, jsons}
    }

    function controlFixedLength (values, lineNo) {
      const err = []

      if (headerIsSet && keysLength !== values.length) {
        const msg  = {msg: 'Number of values does not match number of headers'}
        const line = verbose > 0 ? {line: lineNo}                                                         : {}
        const info = verbose > 1 ? {info: `values [${values.join(',')}] and headers [${keys.join(',')}]`} : {}
        err.push(Object.assign(msg, line, info))
      }
    
      return {err, values}
    }
    
    // NOT YET IMPLEMENTED
    function removeWhitespaces (verbose) {
      return (values, line) => {
        const err = []
    
        return {err, values}
      }
    }
    
    // NOT YET IMPLEMENTED
    function removeEmptyValues (verbose) {
      return (values, line) => {
        const err = []
    
        return {err, values}
      }
    }
    
    // NOT YET IMPLEMENTED
    function emptyToNull (verbose) {
      return (values, line) => {
        const err = []
    
        return {err, values}
      }
    }
    
    // NOT YET IMPLEMENTED
    function missingToNull (verbose) {
      return (values, line) => {
        const err = []
    
        return {err, values}
      }
    }
  }
}

function handleMissingOption (field, options, argv) {
  if (typeof field === 'undefined') {
    const msg  = {msg: `Please provide ${options} option`}
    const line = argv.verbose > 0 ? {line: -1}                   : {}
    const info = argv.verbose > 1 ? {info: JSON.stringify(argv)} : {}
    return [Object.assign(msg, line, info)]
  }
  return []
}