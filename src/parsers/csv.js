const dsv = require('./dsv')

module.exports = {
  name: 'csv',
  desc: 'is a csv parser.',
  func: dsv.dsv({
    delimiter:       ',',
    quote:           '"',
    escape:          '"',
    header:          '[]',
    skipHeader:      false,
    fixedLength:     true,
    trimWhitespaces: false,
    skipEmptyValues: false,
    missingIsNull:   true,
    emptyIsNull:     true
  })
}