# TSTyche

[![version][version-badge]][version-url]
[![license][license-badge]][license-url]
[![requirements][requirements-badge]][requirements-url]
[![install-size][install-size-badge]][install-size-url]
[![coverage][coverage-badge]][coverage-url]
[![discord][discord-badge]][discord-url]

The Essential Type Testing Tool.

---

TSTyche is a type testing tool for TypeScript. It ships with `describe()` and `test()` helpers, `expect` style assertions and a mighty test runner.

## Helpers

If you are used to test JavaScript, a simple type test file should look familiar:

```ts
import { expect, test } from "tstyche";

function firstItem<T>(target: Array<T>): T | undefined {
  return target[0];
}

test("firstItem", () => {
  expect(firstItem(["a", "b", "c"])).type.toBe<string | undefined>();

  expect(firstItem()).type.toRaiseError("Expected 1 argument");
});
```

To organize, debug and plan tests TSTyche has:

- `test()`, `it()` and `describe()` helpers,
- with `.only`, `.skip` and `.todo` run mode flags.

## Assertions

The assertions can be used to write type tests (like in the above example) or mixed in your functional tests:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import * as tstyche from "tstyche";

function secondItem<T>(target: Array<T>): T | undefined {
  return target[1];
}

test("handles numbers", () => {
  assert.strictEqual(secondItem([1, 2, 3]), 2);

  tstyche.expect(secondItem([1, 2, 3])).type.toBe<number | undefined>();
});
```

Here is the list of all matchers:

- `.toBe()`, `.toBeAssignableTo()`, `.toBeAssignableWith()`, `.toMatch()` compare types or types of expression,
- `.toAcceptProps()` checks types of JSX component's props,
- `.toHaveProperty()` looks up keys on an object type,
- `.toRaiseError()` captures the type error message or code,
- `.toBeString()`, `.toBeNumber()`, `.toBeVoid()` and 9 more shorthand checks for primitive types.

## Runner

The `tstyche` command is the heart of TSTyche. For example, it can select test files by path, filter tests by name and pass them through TypeScript `4.8` and `latest`:

```sh
tstyche JsonObject --only external --target 4.8,latest
```

This simple! (And it has the watch mode too.)

## Documentation

Visit [https://tstyche.org](https://tstyche.org) to view the full documentation.

## Feedback

If you have any questions or suggestions, [start a discussion](https://github.com/tstyche/tstyche/discussions/new/choose) or [open an issue](https://github.com/tstyche/tstyche/issues/new/choose) on GitHub. Preferring a chat? Join our [Discord server][discord-url].

## License

[MIT][license-url] © TSTyche

[version-badge]: https://badgen.net/npm/v/tstyche
[version-url]: https://npmjs.com/package/tstyche
[license-badge]: https://badgen.net/github/license/tstyche/tstyche
[license-url]: https://github.com/tstyche/tstyche/blob/main/LICENSE.md
[requirements-badge]: https://badgen.net/npm/node/tstyche
[requirements-url]: https://tstyche.org/reference/requirements
[install-size-badge]: https://badgen.net/packagephobia/install/tstyche
[install-size-url]: https://packagephobia.com/result?p=tstyche
[coverage-badge]: https://badgen.net/codacy/coverage/a581ca5c323a455886b7bdd9623c4ec8
[coverage-url]: https://app.codacy.com/gh/tstyche/tstyche/coverage/dashboard
[discord-badge]: https://badgen.net/static/chat/on%20Discord
[discord-url]: https://discord.gg/gCSasd3QJq
