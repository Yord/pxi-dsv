module.exports = {
  chunkers:      [],
  deserializers: [
    require('./src/deserializers/dsv'),
    require('./src/deserializers/csv'),
    require('./src/deserializers/tsv'),
    require('./src/deserializers/ssv')
  ],
  appliers:      [],
  serializers:   [
    require('./src/serializers/dsv'),
    require('./src/serializers/csv'),
    require('./src/serializers/tsv'),
    require('./src/serializers/ssv')
  ]
}