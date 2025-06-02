# Development

For the smoothest development experience in this codebase, you'll need:

- [Node.js] — Install the latest Long Term Support (LTS) release.
  - Recommended: use [n] or similar tool for managing Node.js versions.

You'll do a typical setup sequence from there.

Update local packages:

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
