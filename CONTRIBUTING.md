# Contributing

Pull requests and suggestions are welcome! Before submitting new features or behavior changes, please [open an issue](https://github.com/tstyche/tstyche/issues/new) to discuss the idea or propose changes.

## Prerequisites

To work with this repository, you will need the latest LTS version of Node.js and the latest version of Aube. We use `mise` to get both of them set up correctly.

To install `mise`, follow [their instructions](https://mise.jdx.dev/getting-started.html). Then install the dependencies:

```shell
aube install
```

### Using Nix (alternative)

If you prefer Nix, a `flake.nix` and `.envrc` are provided. Install [`nix-shell`](https://nixos.org/download) and [`direnv`](https://direnv.net/docs/installation), then allow the environment:

```shell
direnv allow
```

This will automatically provide Node.js and Aube. Then install the dependencies:

```shell
aube install
```

### Why `aube`?

Running `aube exec tstyche` in this repository just works. Thanks to Aube, we can implement new features and immediately try them as a user. To see how that works, run:

```shell
aube exec tstyche callbacks
```

### Why `mise`?

Its `exec` command simplifies running TSTyche using the specific Node.js version. This is useful when working with reported bugs or trying out new features. For example, the following works smoothly only with the recent Node.js versions:

```shell
mise exec node@22 -- aube exec tstyche template
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

To collect code coverage, run the command with the `--coverage` flag (note that in this case the library must be built with the `--sourcemap` flag to ensure accurate mapping):

```shell
aube build --sourcemap
aube test:run tests/api-expect.test.js --coverage
```

Or run both steps together with:

```shell
aube test:run:coverage tests/api-expect.test.js
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
