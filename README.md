# TSTyche

[![version][version-badge]][version-url]
[![license][license-badge]][license-url]
[![install-size][install-size-badge]][install-size-url]
[![coverage][coverage-badge]][coverage-url]

Everything You Need for Type Testing.

---

TSTyche is a type testing tool for TypeScript. It ships with `describe()` and `test()` helpers, `expect` style assertions and a mighty test runner.

## Helpers

If you are used to testing, a type test should look familiar:

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

To group and organize tests, TSTyche has:

- `test()`, `it()` and `describe()` helpers,
- with `.only`, `.skip` and `.todo` run mode flags.

## Assertions

The `expect` style assertions can check either the inferred type of an expression (as in the example above) or a type directly:

```ts
import { expect } from "tstyche";

type AsyncProps<T> = {
  [K in keyof T]+?: Promise<T[K]> | T[K];
};

type WithLoading<T> = T & { loading: boolean };

expect<WithLoading<AsyncProps<{ id: string }>>>().type.toBe<{
  id?: Promise<string> | string;
  loading: boolean;
}>();
```

Here is the list of all matchers:

- `.toBe()`, `.toBeAssignableFrom()`, `.toBeAssignableTo()` compare types or type of expressions,
- `.toAcceptProps()` checks the type of JSX component props,
- `.toBeApplicable` ensures that the decorator function can be applied,
- `.toBeCallableWith()` checks whether a function is callable with the given arguments,
- `.toBeConstructableWith()` checks whether a class is constructable with the given arguments,
- `.toHaveProperty()` looks up keys on an object type.

## Runner

The `tstyche` command is the heart of TSTyche. For example, it can select test files by path, filter tests by name and to run the tests against specific versions of TypeScript:

```shell
tstyche query-params --only multiple --target '>=5.6'
```

And there is even more what TSTyche can do:

- check messages of errors silenced by `// @ts-expect-error`,
- generate type tests from a data table,
- run tests in watch mode.

## Documentation

Visit [tstyche.org](https://tstyche.org) to view the full documentation.

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
