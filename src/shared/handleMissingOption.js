module.exports = (field, options, argv) => {
  if (typeof field === 'undefined') {
    const msg  = {msg: `Please provide ${options} option`}
    const line = argv.verbose > 0 ? {line: -1}                   : {}
    const info = argv.verbose > 1 ? {info: JSON.stringify(argv)} : {}
    return [Object.assign(msg, line, info)]
  }
  return []
}