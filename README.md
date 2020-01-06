![@pfx/dsv teaser][teaser]

`@pfx/dsv` is a delimiter separated values plugin for `pf`, the fast and extensible command-line data (e.g. JSON) processor and transformer.

See the [`pf` github repository][pf] for more details!

[![node version][node-shield]][node]
[![npm version][npm-shield]][npm-package]
[![license][license-shield]][license]
[![PRs Welcome][prs-shield]][pfx-how-to-contribute]
[![linux unit tests status][linux-unit-tests-shield]][actions]
[![macos unit tests status][macos-unit-tests-shield]][actions]
[![windows unit tests status][windows-unit-tests-shield]][actions]

## Installation

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

For a much more detailed description, see the [`.pfrc` module documentation][pf-pfrc-module] in the [`pf` repository][pf].

## Extensions

This plugin comes with the following `pf` extensions:

|                  | Description                                                                                                                                                       |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dsv` parser     | Parses delimiter-separated values files. The delimiter, quote, and escape characters, as well as several other options make it very flexible.                     |
| `csv` parser     | Parses comma-separated values files. Follows RFC4180 for the most part. Uses `dsv` internally and accepts the same options.                                       |
| `tsv` parser     | Parses tab-separated values files. Useful for processing tabular database and spreadsheet data. Uses `dsv` internally and accepts the same options.               |
| `ssv` parser     | Parses space-separated values files. Useful for processing command line output from `ls`, `ps`, and the like. Uses `dsv` internally and accepts the same options. |
| `csv` marshaller | Serializes JSON into CSV format.                                                                                                                                  |

## Reporting Issues

Please report issues [at the `pf` repository][issues]!

## License

`@pfx/dsv` is [MIT licensed][license].

[npm-package]: https://www.npmjs.com/package/@pfx/dsv
[license]: https://github.com/Yord/pfx-dsv/blob/master/LICENSE
[teaser]: ./teaser.gif
[pf]: https://github.com/Yord/pf
[actions]: https://github.com/Yord/pfx-dsv/actions
[npm-shield]: https://img.shields.io/npm/v/@pfx/dsv.svg?color=orange&labelColor=313A42
[license-shield]: https://img.shields.io/npm/l/@pfx/dsv?color=yellow&labelColor=313A42
[node-shield]: https://img.shields.io/node/v/@pfx/dsv?color=red&labelColor=313A42
[node]: https://nodejs.org/
[prs-shield]: https://img.shields.io/badge/PRs-welcome-green.svg?labelColor=313A42
[pfx-how-to-contribute]: https://github.com/Yord/pf
[linux-unit-tests-shield]: https://github.com/Yord/pfx-dsv/workflows/linux/badge.svg?branch=master
[macos-unit-tests-shield]: https://github.com/Yord/pfx-dsv/workflows/macos/badge.svg?branch=master
[windows-unit-tests-shield]: https://github.com/Yord/pfx-dsv/workflows/windows/badge.svg?branch=master
[issues]: https://github.com/Yord/pf/issues
[pf-pfrc-module]: https://github.com/Yord/pf#pfrc-module