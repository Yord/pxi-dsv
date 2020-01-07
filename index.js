module.exports = {
  lexers:      [],
  parsers:     [
    require('./src/parsers/dsv2'),
    require('./src/parsers/csv'),
    require('./src/parsers/tsv'),
    require('./src/parsers/ssv')
  ],
  applicators: [],
  marshallers: [
    require('./src/marshallers/csv')
  ]
}