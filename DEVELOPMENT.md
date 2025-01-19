# Development

For the smoothest development experience in this codebase, you'll need:

- [Node.js] — You'll need at least v18, but would be better served with v22.
- [nvm] — Optional, but helpful.
- [yarn] — Not just npm.
- [hyperfine] — Optional for many basic tasks, but required for performance metrics.

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

You can then see everything as a user would, by running tstyche against some example tests:

```shell
yarn test:examples
```

Which is just an alias for:

```shell
tstyche ./examples
```

## Install notes for macos

- You can't just `brew install yarn`.
  It will install an ancient version, and won't work.
  Instead, see the [yarn setup instructions].

- For hyperfine, the version from brew works well enough: `brew install hyperfine`.

## Before you commit

Please make sure the CI tests will pass:

```shell
yarn build
yarn lint
yarn check
yarn test
```

[Node.js]: https://nodejs.org
[nvm]: https://github.com/nvm-sh/nvm
[yarn]: https://yarnpkg.com/getting-started/install
[hyperfine]: https://github.com/sharkdp/hyperfine
[yarn setup instructions]: https://yarnpkg.com/getting-started/install
