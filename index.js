module.exports = {
  lexers:      [],
  parsers:     [
    require('./src/parsers/dsv'),
    require('./src/parsers/csv'),
    require('./src/parsers/tsv'),
    require('./src/parsers/ssv')
  ],
  applicators: [],
  marshallers: [
    require('./src/marshallers/dsv'),
    require('./src/marshallers/csv')
  ]
}