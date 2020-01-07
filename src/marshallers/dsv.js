const handleMissingOption = require('../shared/handleMissingOption')

module.exports = {
  name: 'dsv',
  desc: (
    'is a delimiter-separated values marshaller:\n\n' +
    '--mrecord-separator, --record-separator, -R [char]\nCharacter used to separate records.\n\n' +
    '--mdelimiter, --delimiter, -D [char]\nDelimiter used to separate values.\n\n' +
    '--mquote, --quote, -Q [char]\nCharacter used to quote strings.\n\n' +
    '--mescape, --escape, -C [char]\nCharacter used to escape quote in strings.\n\n' +
    '--mheader, --header, -H [string]\nProvide a custom header as a JSON array string.\n\n' +
    '--mskip-header, --skip-header, -S [boolean]\nDo not print a header.\n\n' +
    '--mallow-list-values, --allow-list-values, -L [boolean]\nWhether lists and objects are allowed in csv values or not. Lists and objects are encoded as JSON.\n\n' +
    '--mfixed-length, --fixed-length, -F [boolean]\nPreprocessing #1: Controls, whether each line has the same number of values. Ignores all deviating lines while reporting errors.\n\n' +
    '--mtrim-whitespaces, --trim-whitespaces, -W [boolean]\nPreprocessing #2: Trim whitespaces around values.\n\n' +
    '--mempty-as-null, --empty-as-null, -I [boolean]\nPreprocessing #3: Treat empty fields as null.\n\n' +
    '--mskip-null, --skip-null, -N [boolean]\nPreprocessing #4: Skip values that are null.\n\n' +
    '--mmissing-as, --missing-as, -M [string]\nPreprocessing #5: Treat missing fields (if #values < #keys) as null.\n'
  ),
  func: dsv({}),
  dsv
}

function dsv (defaults) {
  return argv => {
    const {
      verbose,
      mrecordSeparator,      recordSeparator,      R,
      mdelimiter,            delimiter,            D,
      mquote,                quote,                Q,
      mescape,               escape,               C,
      mheader,               header,               H,
      mskipHeader,           skipHeader,           S,
      mallowListValues,      allowListValues,      L,
      mfixedLength,          fixedLength,          F,
      mtrimWhitespaces,      trimWhitespaces,      W,
      memptyAsNull,          emptyAsNull,          I,
      mskipNullAndUndefined, skipNullAndUndefined, N,
      mmissingAs,            missingAs,            M
    } = argv

    const _recordSeparator      = mrecordSeparator      || recordSeparator      || R || defaults.recordSeparator
    const _delimiter            = mdelimiter            || delimiter            || D || defaults.delimiter
    const _quote                = mquote                || quote                || Q || defaults.quote
    const _escape               = mescape               || escape               || C || defaults.escape
    const _header               = mheader               || header               || H || defaults.header
    const _skipHeader           = mskipHeader           || skipHeader           || S || defaults.skipHeader           || false
    const _allowListValues      = mallowListValues      || allowListValues      || L || defaults.allowListValues      || false
    const _fixedLength          = mfixedLength          || fixedLength          || F || defaults.fixedLength          || false
    const _trimWhitespaces      = mtrimWhitespaces      || trimWhitespaces      || W || defaults.trimWhitespaces      || false
    const _emptyAsNull          = memptyAsNull          || emptyAsNull          || I || defaults.emptyAsNull          || false
    const _skipNullAndUndefined = mskipNullAndUndefined || skipNullAndUndefined || N || defaults.skipNullAndUndefined || false
    const _missingAs            = mmissingAs            || missingAs            || M || defaults.missingAs            || undefined

    const missingOptions = [
      handleMissingOption(_recordSeparator, 'mrecordSeparator, recordSeparator or R', argv),
      handleMissingOption(_delimiter,       'mdelimiter, delimiter or D',             argv),
      handleMissingOption(_quote,           'mquote, quote or Q',                     argv),
      handleMissingOption(_escape,          'mescape, escape or C',                   argv),
      handleMissingOption(_header,          'mheader, header or H',                   argv)
    ]
    let err      = []
    for (let i = 0; i < missingOptions.length; i++) {
      const errs = missingOptions[i]
      err        = err.concat(errs)
    }
    if (err.length > 0) return () => ({err, str: ''})

    const keys              = JSON.parse(_header)

    // skipHeader | header || addProvidedHeader | keysWritten | ignoreDataHeader
    // true       | [...]  || false             | true        | true
    // true       | []     || false             | true        | true
    // false      | [...]  || true              | false       | false
    // false      | []     || false             | false       | false

    const addProvidedHeader = !_skipHeader && keys.length > 0
    let keysWritten         = _skipHeader
    let ignoreDataHeader    = _skipHeader
    const fillMissingValues = typeof _missingAs !== 'undefined'

    const preprocessingFs   = []
                               preprocessingFs.push(jsonsToStrings)
    if (_fixedLength)          preprocessingFs.push(controlFixedLength)
    if (_trimWhitespaces)      preprocessingFs.push(removeWhitespaces)
    if (_emptyAsNull)          preprocessingFs.push(emptyToNull)
    if (_skipNullAndUndefined) preprocessingFs.push(removeNulls)
    if (fillMissingValues)     preprocessingFs.push(fillUpValues)

    const preprocessingF = (values, line) => {
      let err     = []
      let values2 = values

      for (let i = 0; i < preprocessingFs.length; i++) {
        const f   = preprocessingFs[i]
        const res = f(values2, line)
        if (res.err.length > 0) err = err.concat(res.err)
        values2   = res.values
      }

      return {err, values: values2}
    }

    return jsons => {
      const err = []
      let str   = ''

      let values = []

      if (!keysWritten) {
        if (addProvidedHeader) values.push(keys)
        keysWritten = true
      }

      // Maybe move preprocessing down (to HERE)
      const line  = verbose > 0 ? lines[i] : undefined
      const res   = preprocessingF(jsons, line)
      if (res.err.length > 0) err = err.concat(res.err)
      values      = values.concat(res.values)

      const start = ignoreDataHeader ? 1 : 0
      if (ignoreDataHeader) ignoreDataHeader = false

      for (let i = start; i < values.length; i++) {
        const value = values[i]

        // HERE could be a good place for preprocessing

        str += value[0]
        for (let i = 1; i < value.length; i++) str += _delimiter + value[i]
        str += _recordSeparator
      }

      return ({err, str})
    }

    function jsonsToStrings (values) {
      // add quotes to values?
      // escape quotes in values?

      // use _allowListValues when transforming values
      _allowListValues

      // Could be part of preprocessing
      // somewhere here: convert each json into a list of strings that is fed into preprocessing
      //                 the json type is important here (array vs. object vs. others)
      return {err: [], values}
    }

    function controlFixedLength (values) {
      return {err: [], values}
    }

    function removeWhitespaces (values) {
      return {err: [], values}
    }

    function emptyToNull (values) {
      return {err: [], values}
    }

    function removeNulls (values) {
      return {err: [], values}
    }

    function fillUpValues (values) {
      // use _missingAs
      _missingAs

      return {err: [], values}
    }
  }
}