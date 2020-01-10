const dsv = require('./dsv')

module.exports = {
  name: 'tsv',
  desc: (
    'is a tab-separated values deserializer. It is a variant of dsv, but differs in its default values: ' +
    "--delimiter is set to '\t' (tab), --quote and --escape to '\"' (but should not be used in tsv files), " +
    'and the --fixed-length flag is turned on by default. ' +
    'To turn it off, csv supports the following additional options:\n\n' +
    '--no-dfixed-length, --no-fixed-length, -F [boolean]\nTurns off --dfixed-length, --fixed-length, and -F.\n'
  ),
  func: argv => {
    const {noDfixedLength, noFixedLength, F} = argv

    const fixedLength = !(noDfixedLength || noFixedLength || F || false)

    return dsv.dsv({
      delimiter:   '\t',
      quote:       '"',
      escape:      '"',
      header:      '[]'
    })({
      ...argv,
      dfixedLength: fixedLength,
      fixedLength:  fixedLength,
      F:            fixedLength
    })
  }
}