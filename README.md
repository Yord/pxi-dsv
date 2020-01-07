![@pfx/dsv teaser][teaser]

`@pfx/dsv` is a delimiter separated values plugin for `pf`, the fast and extensible command-line data (e.g. JSON) processor and transformer.

See the [`pf` github repository][pf] for more details!

[![node version][shield-node]][node]
[![npm version][shield-npm]][npm-package]
[![license][shield-license]][license]
[![PRs Welcome][shield-prs]][contribute]
[![linux unit tests status][shield-unit-tests-linux]][actions]
[![macos unit tests status][shield-unit-tests-macos]][actions]
[![windows unit tests status][shield-unit-tests-windows]][actions]

## Installation

> :ok_hand: `@pfx/dsv` comes preinstalled in `pf`. No installation necessary. If you still want to install it, proceed as described below.

`@pfx/dsv` is installed in `~/.pfrc/` as follows:

```bash
npm install @pfx/dsv
```

The plugin is included in `~/.pfrc/index.js` as follows:

```js
const dsv = require('@pfx/dsv')

module.exports = {
  plugins:  [dsv],
  context:  {},
  defaults: {}
}
```

For a much more detailed description, see the [`.pfrc` module documentation][pfrc-module].

## Extensions

This plugin comes with the following `pf` extensions:

|                  | Description                                                                                                                                                       |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dsv` parser     | Parses delimiter-separated values files. The delimiter, quote, and escape characters, as well as several other options make it very flexible.                     |
| `csv` parser     | Parses comma-separated values files. Follows RFC4180 for the most part. Uses `dsv` internally and accepts the same options.                                       |
| `tsv` parser     | Parses tab-separated values files. Useful for processing tabular database and spreadsheet data. Uses `dsv` internally and accepts the same options.               |
| `ssv` parser     | Parses space-separated values files. Useful for processing command line output from `ls`, `ps`, and the like. Uses `dsv` internally and accepts the same options. |
| `csv` marshaller | Serializes JSON into CSV format.                                                                                                                                  |

## Known Limitations

This plugin has the following limitations:

1.  The parsers do not cast strings to other data types, like numbers or booleans.
    This is intentional.
    Since different use cases need different data types, and some use cases need their integers to be strings,
    e.g. in case of IDs, there is no way to know for sure when to cast a string to another type.
    If you need different types, you may cast strings by using functions.
2.  The `tsv` parser is implemented in terms of the `dsv` parser and thus supports quotes and escaping tabs.
    Other implementations of `tsv` parsers do not allow tabs in values and have no need of quotes and escapes.
    This means, the current `tsv` implementation works just fine, but a dedicated implementation should be more performant.
    A dedicated implementation may come at some time in the future.
3.  The `csv` parser does not appear to support multi-line values, aka values with line breaks inside quotes.
    Actually, no `pf` parser could support this feature alone, since it is the lexers' responsibility to chunk data for parsers.
    Currently there is no dedicated lexer that supports chunking multi-line csv files, but there may be in the future.
4.  Currently, the plugin only supports marshallers for `csv`.
    This will change in the upcoming versions.

## Reporting Issues

Please report issues [in the tracker][issues]!

## License

`@pfx/dsv` is [MIT licensed][license].

[actions]: https://github.com/Yord/pfx-dsv/actions
[contribute]: https://github.com/Yord/pf
[issues]: https://github.com/Yord/pf/issues
[license]: https://github.com/Yord/pfx-dsv/blob/master/LICENSE
[node]: https://nodejs.org/
[npm-package]: https://www.npmjs.com/package/@pfx/dsv
[pf]: https://github.com/Yord/pf
[pfrc-module]: https://github.com/Yord/pf#pfrc-module
[shield-license]: https://img.shields.io/npm/l/@pfx/dsv?color=yellow&labelColor=313A42
[shield-node]: https://img.shields.io/node/v/@pfx/dsv?color=red&labelColor=313A42
[shield-npm]: https://img.shields.io/npm/v/@pfx/dsv.svg?color=orange&labelColor=313A42
[shield-prs]: https://img.shields.io/badge/PRs-welcome-green.svg?labelColor=313A42
[shield-unit-tests-linux]: https://github.com/Yord/pfx-dsv/workflows/linux/badge.svg?branch=master
[shield-unit-tests-macos]: https://github.com/Yord/pfx-dsv/workflows/macos/badge.svg?branch=master
[shield-unit-tests-windows]: https://github.com/Yord/pfx-dsv/workflows/windows/badge.svg?branch=master
[teaser]: ./teaser.gif