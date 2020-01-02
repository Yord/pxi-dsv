module.exports = {
  lexers:      [],
  parsers:     [
    require('./src/parsers/csv'),
    require('./src/parsers/dsv')
  ],
  applicators: [],
  marshallers: [
    require('./src/marshallers/csv')
  ]
}