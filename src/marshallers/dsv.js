module.exports = {
  name: 'dsv',
  desc: 'is a delimiter-separated values marshaller.',
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return argv => values => ({err: [], str: ''})
}