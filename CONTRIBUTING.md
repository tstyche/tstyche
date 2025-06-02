# Contributing

Pull requests and suggestions are welcome! Before submitting new features or behavior changes, please [open an issue](https://github.com/tstyche/tstyche/issues/new) to discuss the idea or propose changes.

## Prerequisites

To be able to work with this repository, you will need the latest LTS version of Node.js and the latest version of Yarn. We use Volta to get both of them set up correctly.

To install Volta, follow [their instructions](https://docs.volta.sh/guide/getting-started). Next, tell Yarn to install the dependencies:

```shell
yarn install
```

And you are ready!

### Why Yarn?

Running `yarn tstyche` in this repository just works. Thanks to Yarn, we can implement new features and immediately try them as a user. To see how that works, run:

```shell
yarn tstyche callbacks
```

### Why Volta?

Its `run` command simplifies running TSTyche using the specific Node.js version. That is useful while working with reported bugs or trying out new features. For example, the following works smoothly only with the recent Node.js versions:

```shell
volta run --node 24 yarn tstyche template
```

## Development

TSTyche mostly relies on the end-to-end tests. Testing the user experience gives confidence that everything works as expected. Therefore, first build the code:

```shell
yarn build
```

and next run the tests:

```shell
yarn test
```

## Before Opening a Pull Request

Make sure the following is passing:

```shell
yarn build
yarn lint
yarn check
yarn test
```
