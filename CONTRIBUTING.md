# Contributing

Pull requests and suggestions are welcome! Before submitting new features or behavior changes, please [open an issue](https://github.com/tstyche/tstyche/issues/new) to discuss the idea or propose changes.

## Prerequisites

To be able to work with this repository, you will need the latest LTS version of Node.js and the latest version of Yarn. We use `mise` to get both of them set up correctly.

To install `mise`, follow [their instructions](https://mise.jdx.dev/getting-started.html). Next, tell Yarn to install the dependencies:

```shell
yarn install
```

And you are ready!

### Using Nix (alternative)

If you prefer Nix, a `flake.nix` and `.envrc` are provided. Install [`nix-shell`](https://nixos.org/download) and [`direnv`](https://direnv.net/docs/installation), then allow the environment:

```shell
direnv allow
```

This will automatically provide Node.js and Yarn via `corepack`. Then install the dependencies:

```shell
yarn install
```

### Why Yarn?

Running `yarn tstyche` in this repository just works. Thanks to Yarn, we can implement new features and immediately try them as a user. To see how that works, run:

```shell
yarn tstyche callbacks
```

### Why `mise`?

Its `exec` command simplifies running TSTyche using the specific Node.js version. That is useful while working with reported bugs or trying out new features. For example, the following works smoothly only with the recent Node.js versions:

```shell
mise exec node@22 -- yarn tstyche template
```

## Development

TSTyche relies primarily on end-to-end tests to verify the user experience. This approach ensures everything works as expected in real-world scenarios.

First, build the library:

```shell
yarn build
```

Then run the full test suite:

```shell
yarn test
```

Or a particular test file:

```shell
yarn test:run tests/api-expect.test.js
```

To collect code coverage for a specific test (the `--sourcemap` flag ensures accurate coverage mapping):

```shell
yarn build --sourcemap
yarn test:run tests/api-expect.test.js --coverage
```

Or run both steps together with:

```shell
yarn test:run:coverage tests/api-expect.test.js
```

## Before Opening a Pull Request

Make sure the following is passing:

```shell
yarn build
yarn lint
yarn check
yarn test
```
