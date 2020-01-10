const dsv = require('./dsv')

module.exports = {
  name: 'tsv',
  desc: (
    'is a tab-separated values serializer. It is a variant of dsv, but differs in its default values: ' +
    "--record-separator is set to '\\n', --delimiter is set to '\t' (tab), --quote and --escape to '\"' " +
    '(but should not be used in tsv files), and the --fixed-length flag is turned on by default. ' +
    'To turn it off, csv supports the following additional options:\n\n' +
    '--no-sfixed-length, --no-fixed-length, -F [boolean]\nTurns off --sfixed-length, --fixed-length, and -F.\n'
  ),
  func: argv => {
    const {noSfixedLength, noFixedLength, F} = argv

    const fixedLength = !(noSfixedLength || noFixedLength || F || false)

    return dsv.dsv({
      recordSeparator: '\n',
      delimiter:       '\t',
      quote:           '"',
      escape:          '"',
      header:          '[]'
    })({
      ...argv,
      sfixedLength: fixedLength,
      fixedLength:  fixedLength,
      F:            fixedLength
    })
  }
}