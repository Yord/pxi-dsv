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

Usually, `@pfx/dsv` is installed in `~/.pfrc/` as follows:

```bash
npm install @pfx/dsv
```

The plugin is included in `~/.pfrc/index.js` as follows:

```js
const dsvPlugin = require('@pfx/dsv')

module.exports = {
  plugins:  [dsvPlugin],
  context:  {},
  defaults: {}
}
```

For a much more detailed description, see the [`pf` repository][pf].

## Reporting Issues

Please report issues [at the `pf` repository][issues]!

## License

`@pfx/dsv` is [MIT licensed][license].

[npm-package]: https://www.npmjs.com/package/@pfx/dsv
[license]: https://github.com/Yord/pfx-dsv/blob/master/LICENSE
[teaser]: ./teaser.gif
[pf]: https://github.com/Yord/pf
[actions]: https://github.com/Yord/pfx-dsv/actions
[npm-shield]: https://img.shields.io/npm/v/@pfx/dsv.svg?color=orange
[license-shield]: https://img.shields.io/npm/l/@pfx/dsv?color=yellow
[node-shield]: https://img.shields.io/node/v/@pfx/dsv?color=red
[node]: https://nodejs.org/
[prs-shield]: https://img.shields.io/badge/PRs-welcome-green.svg
[pfx-how-to-contribute]: https://github.com/Yord/pf
[linux-unit-tests-shield]: https://github.com/Yord/pfx-dsv/workflows/linux/badge.svg?branch=master
[macos-unit-tests-shield]: https://github.com/Yord/pfx-dsv/workflows/macos/badge.svg?branch=master
[windows-unit-tests-shield]: https://github.com/Yord/pfx-dsv/workflows/windows/badge.svg?branch=master
[issues]: https://github.com/Yord/pf/issues