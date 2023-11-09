# TSTyche

[![license][license-src]][license-href]

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

- `test()`, `it()`, `describe()` and `context()` helpers;
- with `.only`, `.skip` and `.todo` run mode flags.

## Assertions

The assertions can be used to write type tests (like in the above example) or mixed in your functional tests:

```ts
import * as tstyche from "tstyche";

function secondItem<T>(target: Array<T>): T | undefined {
  return target[1];
}

describe("secondItem", () => {
  it("should handle numbers", () => {
    expect(secondItem([1, 2, 3])).toBe(1);

    tstyche.expect(secondItem([1, 2, 3])).type.toEqual<number | undefined>();
  });
});
```

Here is the list of all matchers:

- `.toBeAssignable()`, `.toEqual()`, `.toMatch()` compares types or types of expression;
- `.toRaiseError()` captures the error message or code;
- `.toBeString()`, `.toBeNumber()`, `.toBeVoid()` and 9 more checks for primitive types.

## Runner

The `tstyche` command is the heart of TSTyche. For example, it can select test files by path, filter tests by name and pass them through TypeScript `4.8` and `latest`:

```sh
tstyche JsonObject --only external --target 4.8,latest
```

This simple!

## Documentation

Visit [https://tstyche.org][documentation-href] to view the full documentation.

## License

[MIT][license-href] © TSTyche

[documentation-href]: https://tstyche.org
[license-src]: https://badgen.net/github/license/tstyche/tstyche
[license-href]: https://github.com/tstyche/tstyche/blob/main/LICENSE.md
