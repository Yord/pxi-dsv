const dsv = require('./dsv')

module.exports = {
  name: 'ssv',
  desc: (
    'is a comma-separated values serializer. It is a variant of dsv, but differs in its default values: ' +
    "--record-separator is set to '\\n', --delimiter is set to ' ' (one space), --quote and --escape to '\"', " +
    'and the --skip-header flag is turned on by default. ' +
    'To turn it off, csv supports the following additional options:\n\n' +
    '--no-sskip-header, --no-skip-header, -S [boolean]\nTurns off --sskip-header, --skip-header, and -S.\n'
  ),
  func: argv => {
    const {noSskipHeader, noSkipHeader, S} = argv

    const skipHeader = !(noSskipHeader || noSkipHeader || S || false)

    return dsv.dsv({
      recordSeparator: '\n',
      delimiter:       ' ',
      quote:           '"',
      escape:          '"',
      header:          '[]'
    })({
      ...argv,
      sskipHeader: skipHeader,
      skipHeader:  skipHeader,
      S:           skipHeader
    })
  }
}