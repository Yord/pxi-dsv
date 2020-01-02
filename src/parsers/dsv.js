module.exports = {
  name: 'dsv',
  desc: 'is a dsv parser.',
  func: ({
    verbose,
    pdelimiter,       delimiter,       D, // [char] delimiter used to separate values
    pquote,           quote,           Q, // [char] character used to quote Strings
    pescape,          escape,          C, // [char] character used to escape quote in strings
    pheader,          header,          H, // [JSON array string] provide a custom header
    pskipHeader,      skipHeader,      S, // [boolean] do not interpret first line as header
    pfixedLength,     fixedLength,     F, // [boolean] whether each line must have the same number of values
    ptrimWhitespaces, trimWhitespaces, W, // [boolean] trim whitespaces around values
    pskipEmptyValues, skipEmptyValues, E, // [boolean] skip values that are the empty String
    pmissingIsNull,   missingIsNull,   M, // [boolean] treat missing fields (if #values < #keys) as null
    pemptyIsNull,     emptyIsNull,     N  // [boolean] treat empty fields (not empty String!) as null
  }) => {
    const _delimiter       = pdelimiter       || delimiter       || D || ','
    const _quote           = pquote           || quote           || Q || '"'
    const _escape          = pescape          || escape          || C || '"'
    const _header          = pheader          || header          || H || '[]'
    const _skipHeader      = pskipHeader      || skipHeader      || S || false
    
    const _fixedLength     = pfixedLength     || fixedLength     || F || true
    const _trimWhitespaces = ptrimWhitespaces || trimWhitespaces || W || false
    const _skipEmptyValues = pskipEmptyValues || skipEmptyValues || E || false
    const _missingIsNull   = pmissingIsNull   || missingIsNull   || M || true
    const _emptyIsNull     = pemptyIsNull     || emptyIsNull     || N || true

    let keys               = JSON.parse(_header)

    // skipHeader | header || return type | keys            | data header   || headerIsSet | ignoreDataHeader | returnTypeObject
    // true       | [...]  || JSON object | provided header | ignore        || true        | true             | true
    // true       | []     || JSON array  | none            | ignore        || true        | true             | false
    // false      | [...]  || JSON object | provided header | treat as data || true        | false            | true
    // false      | []     || JSON object | data header     | ignore        || false       | true             | true

    let headerIsSet        =  _skipHeader || keys.length > 0
    let ignoreDataHeader   =  _skipHeader || keys.length === 0
    const returnTypeObject = !_skipHeader || keys.length > 0
    
    const postProcessingFs = []

    if (_fixedLength)     postProcessingFs.push(controlFixedLength(verbose, headerIsSet))
    if (_trimWhitespaces) postProcessingFs.push(removeWhitespaces(verbose))
    if (_skipEmptyValues) postProcessingFs.push(removeEmptyValues(verbose))
    if (_emptyIsNull)     postProcessingFs.push(emptyToNull(verbose))
    if (_missingIsNull)   postProcessingFs.push(missingToNull(verbose))

    const postProcessingF = (values, line) => {
      const err   = []
      let values2 = values

      for (let i = 0; i < postProcessingFs.length; i++) {
        const f = postProcessingFs[i]
        const res = f(values, line)
        if (res.err.length > 0) {
          err = err.concat(res.err)
          break
        }
        else values2 = res.values
      }

      return {err, values: values2}
    }

    return (tokens, lines) => {
      const err     = []
      const jsons   = []

      const start = ignoreDataHeader ? 1 : 0

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
                mayBeEscaped                         = false
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

        const line = verbose > 0 ? lines[i] : undefined
        const {err: e, values: values2} = postProcessingF(values, line)
        if (e.length > 0) err           = err.concat(e)
        else              values        = values2

        if (!headerIsSet) {
          keys             = values
          headerIsSet      = true
          ignoreDataHeader = false
        }

        if (returnTypeObject) {
          const json    = {}
          
          const until   = Math.min(keys.length, values.length)

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
  }
}

function controlFixedLength (verbose, headerIsSet) {
  return (values, lineNo) => {
    const err = []

    if (headerIsSet && keys.length !== values.length) {
      const msg  = {msg:  'Number of values does not match number of headers'}
      const line = verbose > 0 ? {line: lineNo}                                                         : {}
      const info = verbose > 1 ? {info: `values [${values.join(',')}] and headers [${keys.join(',')}]`} : {}
      err.push(Object.assign(msg, line, info))
    }
  
    return {err, values}
  }
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