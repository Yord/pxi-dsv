const dsv = require('./dsv')

module.exports = {
  name: 'ssv',
  desc: (
    'is a space-separated values deserializer. It is a variant of dsv, but differs in its default values: ' +
    "--delimiter is set to ' ', --quote and --escape to '\"', " +
    'and the --skip-header, --skip-empty-values, and --trim-whitespaces flags are turned on by default. ' +
    'To turn them off, ssv supports the following additional options:\n\n' +
    '--no-dskip-header, --no-skip-header, -S [boolean]\nTurns off --dskip-header, --skip-header, and -S.\n\n' +
    '--no-dskip-empty-values, --no-skip-empty-values, -E [boolean]\nTurns off --dskip-empty-values, --skip-empty-values, and -E.\n\n' +
    '--no-dtrim-whitespaces, --no-trim-whitespaces, -W [boolean]\nTurns off --dtrim-whitespaces, --trim-whitespaces, and -W.\n'
  ),
  func: argv => {
    const {
      noDskipHeader,      noSkipHeader,      S,
      noDskipEmptyValues, noSkipEmptyValues, E,
      noDtrimWhitespaces, noTrimWhitespaces, W
    } = argv

    const skipHeader      = !(noDskipHeader      || noSkipHeader      || S || false)
    const skipEmptyValues = !(noDskipEmptyValues || noSkipEmptyValues || E || false)
    const trimWhitespaces = !(noDtrimWhitespaces || noTrimWhitespaces || W || false)

    return dsv.dsv({
      delimiter:   ' ',
      quote:       '"',
      escape:      '"',
      header:      '[]'
    })({
      ...argv,
      dskipHeader:      skipHeader,
      skipHeader:       skipHeader,
      S:                skipHeader,
      dskipEmptyValues: skipEmptyValues,
      skipEmptyValues:  skipEmptyValues,
      E:                skipEmptyValues,
      dtrimWhitespaces: trimWhitespaces,
      trimWhitespaces:  trimWhitespaces,
      W:                trimWhitespaces
    })
  }
}