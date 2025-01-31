# Development

For the smoothest development experience in this codebase, you'll need:

- [Node.js] — Install the latest Long Term Support (LTS) release.
  - Recommended: use [n] or similar tool for managing Node.js versions.
- [Yarn] — Not just npm.
- [Hyperfine] — Optional for many basic tasks, but required for performance metrics.

You'll do a typical setup sequence from there.

Update your local packages:

```shell
yarn install
```

Build the app:

```shell
yarn build
```

Run tests:

```shell
yarn test
```

You can then see everything as a user would, by running TSTyche against some example tests:

```shell
yarn test:examples
```

Which is just an alias for:

```shell
tstyche ./examples
```

## Install notes for macOS

- You can't just `brew install yarn`.
  It will install an ancient version, and won't work.
  Instead, see the [Yarn setup instructions].

- For Hyperfine, the version from Brew works well enough: `brew install hyperfine`.

## Before you commit

Please make sure the CI tests will pass:

```shell
yarn build
yarn lint
yarn check
yarn test
```

[Node.js]: https://nodejs.org
[n]: https://github.com/tj/n
[Yarn]: https://yarnpkg.com/getting-started/install
[Hyperfine]: https://github.com/sharkdp/hyperfine
[Yarn setup instructions]: https://yarnpkg.com/getting-started/install
