module.exports = {
  name: 'csv',
  desc: 'is a csv serializer.', // does not support embedded line breaks
  func: ({
    delimiter, mdelimiter, D,
    eol,       meol,       E,
    header,    mheader,    H,
    noHeader,  mnoHeader,  N
  }) => {
    const _delimiter = mdelimiter || delimiter || D || ','
    const _eol       = meol       || eol       || E || '\n'
    const _noHeader  = mnoHeader  || noHeader  || N || false
    const _header    = mheader    || header    || H || '[]'

    let keysWritten  = _noHeader

    return values => {
      let str   = ''
      const err = []

      if (!keysWritten) {
        keysWritten = true

        let keys = JSON.parse(_header)
        if (keys.length === 0) {
          if (values.length > 0) {
            const value = values[0]

            if (Array.isArray(value))           keys = value
            else if (typeof value === 'object') keys = Object.keys(value)
          }
        }

        values.unshift(keys)
      }

      const lines = []
      for (let index = 0; index < values.length; index++) {
        let value = values[index]

        if (typeof value !== 'undefined') {
          if (typeof value === 'object') value = Object.values(value)

          let line = []
          for (let jndex = 0; jndex < value.length; jndex++) {
            let item = value[jndex]
  
            if (typeof item !== 'undefined') {
              item = item.toString()
  
              let needQuotes = false
              let item2      = ''
              for (let undex = 0; undex < item.length; undex++) {
                const ch = item[undex]
                if (ch === _delimiter) {
                  needQuotes = true
                  item2 += ch
                } else if (ch === '"') {
                  needQuotes = true
                  item2 += '""'
                } else if (ch === _eol) item2 += ' '
                else item2 += ch
              }
  
              if (needQuotes) line.push('"' + item2 + '"')
              else            line.push(      item2      )
            }
          }
  
          lines.push(line)
        }
      }

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index]

        if (line.length > 0) {
          str += line[0]
  
          for (let index = 1; index < line.length; index++) {
            const item = line[index]
    
            str += _delimiter + item
          }
  
          str += _eol
        }
      }

      return {err, str}
    }
  }
}