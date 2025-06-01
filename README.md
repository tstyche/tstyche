# TSTyche

[![version][version-badge]][version-url]
[![license][license-badge]][license-url]
[![install-size][install-size-badge]][install-size-url]
[![coverage][coverage-badge]][coverage-url]

Everything You Need for Type Testing.

---

TSTyche is a type testing tool for TypeScript. It ships with `describe()` and `test()` helpers, `expect` style assertions and a mighty test runner.

## Helpers

If you are used to test JavaScript, a simple type test file should look familiar:

```ts
import { expect, test } from "tstyche";

function isSameLength<T extends { length: number }>(a: T, b: T) {
  return a.length === b.length;
}

test("isSameLength", () => {
  expect(isSameLength([1, 2], [1, 2, 3])).type.toBe<boolean>();
  expect(isSameLength("one", "two")).type.toBe<boolean>();

  expect(isSameLength).type.not.toBeCallableWith(1, 2);
});
```

To organize, debug and plan tests TSTyche has:

- `test()`, `it()` and `describe()` helpers,
- with `.only`, `.skip` and `.todo` run mode flags.

## Assertions

The assertions can be used to write type tests (like in the above example) or mixed in your unit tests:

```ts
import assert from "node:assert";
import test from "node:test";
import * as tstyche from "tstyche";

function toMilliseconds(value: number) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value * 1000;
  }

  throw new Error("Not a number");
}

test("toMilliseconds", () => {
  const sample = toMilliseconds(10);

  assert.equal(sample, 10_000);
  tstyche.expect(sample).type.toBe<number>();

  // Will pass as a type test and not throw at runtime
  tstyche.expect(toMilliseconds).type.not.toBeCallableWith("20");
});
```

Here is the list of all matchers:

- `.toBe()`, `.toBeAssignableTo()`, `.toBeAssignableWith()` compare types or types of expression,
- `.toAcceptProps()` checks the type of JSX component props,
- `.toBeApplicable` ensures that the decorator function can be applied,
- `.toBeCallableWith()` checks whether a function is callable with the given arguments,
- `.toBeConstructableWith()` checks whether a class is constructable with the given arguments,
- `.toHaveProperty()` looks up keys on an object type,
- `.toRaiseError()` captures the message or code of a type error.

## Runner

The `tstyche` command is the heart of TSTyche. For example, it can select test files by path, filter tests by name and pass them through a range of TypeScript versions:

```shell
tstyche query-params --only multiple --target '>=5.0 <5.3'
```

This simple! (And it has watch mode too.)

## Documentation

Visit [tstyche.org](https://tstyche.org) to view the full documentation.

## Feedback

If you have any questions or suggestions, [start a discussion](https://github.com/tstyche/tstyche/discussions/new/choose) or [open an issue](https://github.com/tstyche/tstyche/issues/new/choose) on GitHub. Preferring a chat? Join our [Discord server](https://discord.gg/gCSasd3QJq).

## License

[MIT][license-url] © TSTyche

[version-badge]: https://badgen.net/npm/v/tstyche
[version-url]: https://npmjs.com/package/tstyche
[license-badge]: https://badgen.net/github/license/tstyche/tstyche
[license-url]: https://github.com/tstyche/tstyche/blob/main/LICENSE.md
[install-size-badge]: https://badgen.net/packagephobia/install/tstyche
[install-size-url]: https://packagephobia.com/result?p=tstyche
[coverage-badge]: https://badgen.net/codacy/coverage/a581ca5c323a455886b7bdd9623c4ec8
[coverage-url]: https://app.codacy.com/gh/tstyche/tstyche/coverage/dashboard
