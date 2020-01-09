const dsv = require('./dsv')

module.exports = {
  name: 'ssv',
  desc: (
    'is a space-separated values deserializer. It is a variant of dsv, but differs in its default values: ' +
    "--delimiter is set to ' ', --quote and --escape to '\"', " +
    'and the --skip-header, --skip-empty-values, and --trim-whitespaces flags are turned on by default. ' +
    'To turn them off, ssv supports the following additional options:\n\n' +
    '--no-pskip-header, --no-skip-header, -S [boolean]\nTurns off --pskip-header, --skip-header, and -S.\n\n' +
    '--no-pskip-empty-values, --no-skip-empty-values, -E [boolean]\nTurns off --pskip-empty-values, --skip-empty-values, and -E.\n\n' +
    '--no-ptrim-whitespaces, --no-trim-whitespaces, -W [boolean]\nTurns off --ptrim-whitespaces, --trim-whitespaces, and -W.\n'
  ),
  func: argv => {
    const {
      noPskipHeader,      noSkipHeader,      S,
      noPskipEmptyValues, noSkipEmptyValues, E,
      noPtrimWhitespaces, noTrimWhitespaces, W
    } = argv

    const skipHeader      = !(noPskipHeader      || noSkipHeader      || S || false)
    const skipEmptyValues = !(noPskipEmptyValues || noSkipEmptyValues || E || false)
    const trimWhitespaces = !(noPtrimWhitespaces || noTrimWhitespaces || W || false)

    return dsv.dsv({
      delimiter:   ' ',
      quote:       '"',
      escape:      '"',
      header:      '[]'
    })({
      ...argv,
      pskipHeader:      skipHeader,
      skipHeader:       skipHeader,
      S:                skipHeader,
      pskipEmptyValues: skipEmptyValues,
      skipEmptyValues:  skipEmptyValues,
      E:                skipEmptyValues,
      ptrimWhitespaces: trimWhitespaces,
      trimWhitespaces:  trimWhitespaces,
      W:                trimWhitespaces
    })
  }
}