const dsv = require('./dsv')

module.exports = {
  name: 'csv',
  desc: (
    'is a comma-separated values parser. It is a variant of dsv, but differs in its default values: ' +
    "--delimiter is set to ',', --quote and --escape to '\"', " +
    'and the --fixed-length, --missing-is-null, and --empty-is-null flags are turned on by default. ' +
    'To turn them off, csv supports the following additional options:\n\n' +
    '--no-pfixed-length, --no-fixed-length, -F [boolean]\nTurns off --pfixed-length and --fixed-length.\n\n' +
    '--no-pmissing-is-null, --no-missing-is-null, -M [boolean]\nTurns off --pmissing-is-null and --missing-is-null.\n\n' +
    '--no-pempty-is-null, --no-empty-is-null, -N [boolean]\nTurns off --pempty-is-null and --empty-is-null.\n'
  ),
  func: argv => {
    const {
      noPfixedLength,   noFixedLength,   F,
      noPmissingIsNull, noMissingIsNull, M,
      noPemptyIsNull,   noEmptyIsNull,   N
    } = argv

    const fixedLength   = !(noPfixedLength   || noFixedLength   || F || false)
    const missingIsNull = !(noPmissingIsNull || noMissingIsNull || M || false)
    const emptyIsNull   = !(noPemptyIsNull   || noEmptyIsNull   || N || false)

    return dsv.dsv({
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
    })({
      ...argv,
      pfixedLength:    fixedLength,
      fixedLength:     fixedLength,
      F:               fixedLength,
      pmissingIsNull:  missingIsNull,
      missingIsNull:   missingIsNull,
      M:               missingIsNull,
      pemptyIsNull:    emptyIsNull,
      emptyIsNull:     emptyIsNull,
      N:               emptyIsNull
    })
  }
}