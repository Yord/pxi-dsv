module.exports = {
  lexers:      [],
  parsers:     [
    require('./src/parsers/csv')
  ],
  applicators: [],
  marshallers: [
    require('./src/marshallers/csv')
  ]
}