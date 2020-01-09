module.exports = {
  chunkers:      [],
  deserializers: [
    require('./src/deserializers/dsv'),
    require('./src/deserializers/csv'),
    require('./src/deserializers/tsv'),
    require('./src/deserializers/ssv')
  ],
  applicators:   [],
  marshallers:   [
    require('./src/marshallers/dsv'),
    require('./src/marshallers/csv'),
    require('./src/marshallers/csv2')
  ]
}