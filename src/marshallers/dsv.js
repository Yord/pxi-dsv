const handleMissingOption = require('../shared/handleMissingOption')

module.exports = {
  name: 'dsv',
  desc: 'is a delimiter-separated values marshaller.',
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return argv => {
    const {
      verbose,
      mrecordSeparator, recordSeparator, R,
      mdelimiter,       delimiter,       D,
      mquote,           quote,           Q,
      mescape,          escape,          C,
      mheader,          header,          H,
      mskipHeader,      skipHeader,      S,
      mfixedLength,     fixedLength,     F,
      mskipEmptyValues, skipEmptyValues, E,
      mtrimWhitespaces, trimWhitespaces, W,
      memptyAsNull,     emptyAsNull,     I,
      mskipNull,        skipNull,        N,
      mmissingAsNull,   missingAsNull,   M
    } = argv

    const _recordSeparator = mrecordSeparator || recordSeparator || R || defaults.recordSeparator
    const _delimiter       = mdelimiter       || delimiter       || D || defaults.delimiter
    const _quote           = mquote           || quote           || Q || defaults.quote
    const _escape          = mescape          || escape          || C || defaults.escape
    const _header          = mheader          || header          || H || defaults.header
    const _skipHeader      = mskipHeader      || skipHeader      || S || defaults.skipHeader      || false
    const _fixedLength     = mfixedLength     || fixedLength     || F || defaults.fixedLength     || false
    const _skipEmptyValues = mskipEmptyValues || skipEmptyValues || E || defaults.skipEmptyValues || false
    const _trimWhitespaces = mtrimWhitespaces || trimWhitespaces || W || defaults.trimWhitespaces || false
    const _emptyAsNull     = memptyAsNull     || emptyAsNull     || I || defaults.emptyAsNull     || false
    const _skipNull        = mskipNull        || skipNull        || N || defaults.skipNull        || false
    const _missingAsNull   = mmissingAsNull   || missingAsNull   || M || defaults.missingAsNull   || false

    const missingOptions = [
      handleMissingOption(_recordSeparator, 'mrecordSeparator, recordSeparator or R', argv),
      handleMissingOption(_delimiter,       'mdelimiter, delimiter or D',             argv),
      handleMissingOption(_quote,           'mquote, quote or Q',                     argv),
      handleMissingOption(_escape,          'mescape, escape or C',                   argv),
      handleMissingOption(_header,          'mheader, header or H',                   argv)
    ]
    let err = []
    for (let i = 0; i < missingOptions.length; i++) {
      const errs = missingOptions[i]
      err = err.concat(errs)
    }
    if (err.length > 0) return () => ({err, str: ''})

    return values => ({err: [], str: ''})
  }
}