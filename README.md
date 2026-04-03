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
import { type _, expect } from "tstyche";

type AsyncProps<T> = {
  [K in keyof T]+?: T[K] | Promise<T[K]>;
};

type WithLoading<T extends object> = T & { loading: boolean };

expect<WithLoading<AsyncProps<{ query: string }>>>().type.toBe<{
  query?: string | Promise<string>;
  loading: boolean;
}>();

expect<WithLoading<_>>().type.not.toBeInstantiableWith<[string]>();
```

Relation matchers:

- `.toBe()` checks if a type is the same as the given type,
- `.toBeAssignableFrom()` checks if a type is assignable from the given type,
- `.toBeAssignableTo()` checks if a type is assignable to the given type.

Ability matchers:

- `.toAcceptProps()` checks if a JSX component accepts the given props,
- `.toBeApplicable` checks if a decorator is applicable to the given class or class member,
- `.toBeCallableWith()` checks if a function is callable with the given arguments,
- `.toBeConstructableWith()` checks if a class is constructable with the given arguments,
- `.toBeInstantiableWith()` checks if a generic is instantiable with the given type arguments,
- `.toHaveProperty()` checks if a type has the given property.

## Runner

The `tstyche` command is the heart of TSTyche. It allows you to select test files by path, filter tests by name and run them against specific versions of TypeScript:

```shell
tstyche query-params --only multiple --target '>=5.6'
```

It is that simple! Actually, TSTyche does even more:

- checks messages of errors suppressed by `@ts-expect-error` directives,
- generates type tests from a data table,
- runs tests in watch mode.

## Try It Out

Try TSTyche online on StackBlitz:

[![Open in StackBlitz][starter-badge]][starter-url]

## Documentation

Visit [tstyche.org](https://tstyche.org) to view the full documentation.

## Roadmap

See [ROADMAP.md](https://github.com/tstyche/tstyche/blob/main/ROADMAP.md) for planned features.

## License

[MIT][license-url] © TSTyche

[version-badge]: https://badgen.net/npm/v/tstyche
[version-url]: https://npmjs.com/package/tstyche
[license-badge]: https://badgen.net/github/license/tstyche/tstyche
[license-url]: https://github.com/tstyche/tstyche/blob/main/LICENSE.md
[install-size-badge]: https://badgen.net/packagephobia/install/tstyche
[install-size-url]: https://packagephobia.com/result?p=tstyche
[coverage-badge]: https://badgen.net/codecov/github/tstyche/tstyche
[coverage-url]: https://app.codecov.io/gh/tstyche/tstyche
[starter-badge]: https://developer.stackblitz.com/img/open_in_stackblitz.svg
[starter-url]: https://tstyche.org/new
