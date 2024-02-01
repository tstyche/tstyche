# TSTyche

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d0d1354921be468db8f355dc3efdf806)](https://app.codacy.com/gh/tstyche/tstyche?utm_source=github.com&utm_medium=referral&utm_content=tstyche/tstyche&utm_campaign=Badge_Grade)

[![version][version-badge]][version-url]
[![license][license-badge]][license-url]
[![packagephobia][packagephobia-badge]][packagephobia-url]
[![coverage][coverage-badge]][coverage-url]

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
  expect(firstItem(["a", "b", "c"])).type.toEqual<string | undefined>();

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

  tstyche.expect(secondItem([1, 2, 3])).type.toEqual<number | undefined>();
});
```

Here is the list of all matchers:

- `.toBeAssignable()`, `.toEqual()`, `.toMatch()` compares types or types of expression,
- `.toHaveProperty()` looks up keys on an object type,
- `.toRaiseError()` captures the type error message or code,
- `.toBeString()`, `.toBeNumber()`, `.toBeVoid()` and 9 more shorthand checks for primitive types.

## Runner

The `tstyche` command is the heart of TSTyche. For example, it can select test files by path, filter tests by name and pass them through TypeScript `4.8` and `latest`:

```sh
tstyche JsonObject --only external --target 4.8,latest
```

This simple!

## Documentation

Visit [https://tstyche.org](https://tstyche.org) to view the full documentation.

## License

[MIT][license-url] © TSTyche

[version-badge]: https://badgen.net/npm/v/tstyche
[version-url]: https://npmjs.com/package/tstyche
[license-badge]: https://badgen.net/github/license/tstyche/tstyche
[license-url]: https://github.com/tstyche/tstyche/blob/main/LICENSE.md
[packagephobia-badge]: https://badgen.net/packagephobia/install/tstyche
[packagephobia-url]: https://packagephobia.com/result?p=tstyche
[coverage-badge]: https://badgen.net/codecov/c/github/tstyche/tstyche
[coverage-url]: https://app.codecov.io/gh/tstyche/tstyche
