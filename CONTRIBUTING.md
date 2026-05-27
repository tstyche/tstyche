# Contributing

Pull requests and suggestions are welcome! Before submitting new features or behavior changes, please [open an issue](https://github.com/tstyche/tstyche/issues/new) to discuss the idea or propose changes.

## Prerequisites

To work with this repository, you will need the latest LTS version of [Node.js](https://nodejs.org) and the latest version of [Aube](https://aube.en.dev). We use `mise` to get both of them set up correctly.

To install `mise`, follow [their instructions](https://mise.jdx.dev/getting-started.html). Then install the dependencies:

```shell
aube install
```

### Why `mise`?

Its `exec` command simplifies running TSTyche using the specific Node.js version. This is useful when working with reported bugs or trying out new features. For example, the following works smoothly only with the recent Node.js versions:

```shell
mise exec node@22 -- aube run tstyche template
```

### Why `aube`?

Running `aube run tstyche` in this repository just works. Thanks to Aube, we can implement new features and immediately try them as a user. To see how that works, run:

```shell
aube run tstyche callbacks
```

## Development

TSTyche relies primarily on end-to-end tests to verify the user experience.

Since tests run against the built library, always build your changes first:

```shell
aube build
```

Then run the full test suite:

```shell
aube test
```

Or a particular test file:

```shell
aube test:run tests/api-expect.test.js
```

To update snapshots, run the command with the `--write` flag:

```shell
aube test:run tests/api-expect.test.js --write
```

To collect code coverage, run the command with the `--coverage` flag (build with `--sourcemap` for accurate source mapping):

```shell
aube build --sourcemap
aube test:run tests/api-expect.test.js --coverage
```

To run `tstyche` or a single test with the inspector enabled, pass the `--inspect` flag to `aube run` (build with `--sourcemap` for accurate source mapping):

```shell
aube build --sourcemap
aube run --inspect tstyche callbacks
aube run --inspect test:run tests/api-expect.test.js
```

## Before Opening a Pull Request

Make sure the following is passing:

```shell
aube build
aube lint
aube spellcheck
aube test
aube typecheck
```
