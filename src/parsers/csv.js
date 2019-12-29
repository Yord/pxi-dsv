module.exports = {
  name: 'csv',
  desc: 'is a csv parser.', // does not support embedded line breaks
  func: ({
    delimiter,  pdelimiter,  D,
    header,     pheader,     H,
    noHeader,   pnoHeader,   N,
    skipEmpty,  pskipEmpty,  E,
    fillHeader, pfillHeader, F
  }) => {
    const _delimiter  = pdelimiter  || delimiter  || D || ','
    const _header     = pheader     || header     || H || '[]'
    const _noHeader   = pnoHeader   || noHeader   || N || false
    const _skipEmpty  = pskipEmpty  || skipEmpty  || E || false
    const _fillHeader = pfillHeader || fillHeader || F || false

    let keys          = JSON.parse(_header)

    return (tokens, lines) => {
      const err   = [] // add error handling
      const jsons = []
      
      for (let line = 0; line < tokens.length; line++) {
        const token = tokens[line]
        let values  = []
        let from    = 0

        for (let at = 0; at < token.length; at++) {
          const ch         = token.charAt(at)

          let mayBeEscaped = false
          let inString     = false
          let valueFound   = false

          if (inString) {
            if (mayBeEscaped) {
              if (ch === _delimiter) {
                valueFound   = true
                mayBeEscaped = false
              } else if (ch !== '"') {
                mayBeEscaped = false
                inString     = false
              } else if (ch === '"') {
                mayBeEscaped = false
              }
            } else {
              if (ch === '"') mayBeEscaped = true
            }
          } else {
            if (ch === '"')             inString   = true
            else if (ch === _delimiter) valueFound = true
          }
          
          if (valueFound) {
            valueFound  = false
            const value = token.slice(from, at)

            if (!_skipEmpty || value !== '') values.push(value)

            from        = at + 1
          }

          if (at === token.length - 1) {
            const value = token.slice(from)
            
            if (!_skipEmpty || value !== '') values.push(value)
          }
        }

        if (_noHeader) {
          if (_fillHeader) {
            const json = {}
            
            for (let jndex = 0; jndex < values.length; jndex++) {
              json[jndex] = values[jndex]
            }
            
            jsons.push(json)
          } else {
            jsons.push(values)
          }
        } else {
          const json = {}

          if (keys.length === 0) keys = values
          else {
            if (_fillHeader) {
              for (let jndex = 0; jndex < Math.max(keys.length, values.length); jndex++) {
                const key   = jndex < keys.length   ? keys[jndex]   : jndex
                const value = jndex < values.length ? values[jndex] : null
                json[key]   = value
              }
            } else {
              for (let jndex = 0; jndex < keys.length; jndex++) {
                const key   = keys[jndex]
                const value = jndex < values.length ? values[jndex] : null
                json[key]   = value
              }
            }
  
            jsons.push(json)
          }
        }
      }

      return {err, jsons}
    }
  }
}