const dsv = require('./dsv')

module.exports = {
  name: 'csv2',
  desc: (
    'is a comma-separated values serializer. ' +
    'To turn it off, csv supports the following additional options:\n\n' +
    '--no-mfixed-length, --no-fixed-length, -F [boolean]\nTurns off --mfixed-length, --fixed-length, and -F.\n'
  ),
  func: argv => {
    const {noMfixedLength, noFixedLength, F} = argv

    const fixedLength = !(noMfixedLength || noFixedLength || F || false)

    return dsv.dsv({
      recordSeparator: '\n',
      delimiter:       ',',
      quote:           '"',
      escape:          '"',
      header:          '[]'
    })({
      ...argv,
      mfixedLength: fixedLength,
      fixedLength:  fixedLength,
      F:            fixedLength
    })
  }
}