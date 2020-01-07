const dsv = require('./dsv2')

module.exports = {
  name: 'csv',
  desc: (
    'is a comma-separated values parser. It is a variant of dsv, but differs in its default values: ' +
    "--delimiter is set to ',', --quote and --escape to '\"', " +
    'and the --fixed-length flag is turned on by default. ' +
    'To turn it off, csv supports the following additional options:\n\n' +
    '--no-pfixed-length, --no-fixed-length, -F [boolean]\nTurns off --pfixed-length, --fixed-length, and -F.\n'
  ),
  func: argv => {
    const {noPfixedLength, noFixedLength, F} = argv

    const fixedLength = !(noPfixedLength || noFixedLength || F || false)

    return dsv.dsv({
      delimiter:   ',',
      quote:       '"',
      escape:      '"',
      header:      '[]'
    })({
      ...argv,
      pfixedLength: fixedLength,
      fixedLength:  fixedLength,
      F:            fixedLength
    })
  }
}