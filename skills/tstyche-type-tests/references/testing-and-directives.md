# Testing helpers and comment directives

The live references are https://tstyche.org/reference/testing-api and https://tstyche.org/reference/directives. These APIs are declared in `types/Describe.ts`, `types/Test.ts`, and `types/Expect.ts`.

## Helpers and flags

```ts
describe("group", () => {
  test("case", () => {
    expect<string>().type.toBe<string>();
  });
});

it.only("focused alias", () => {});
test.skip("ignored", () => {});
describe.todo("planned");
```

`describe` groups may nest. `it` aliases `test`. `.only` focuses and `.skip` suppresses nested type errors; `.todo` also makes the callback optional. Filters from a parent are inherited. The command-line `--only` and `--skip` filters match helper names case-insensitively; `--skip` wins if both select a test.

## Directives

Directives are single-line comments in the `@tstyche` namespace. Arguments use relaxed JSON (unquoted keys, single quotes, and trailing commas are accepted), and a note may follow `--`.

- `// @tstyche fixme` marks one assertion/helper as expected failing. A marked group/helper must contain a failing child.
- `// @tstyche if { target: ">=5.7" }` gates one assertion/helper, or the whole file when placed at the top. Use it for compiler-version-specific declarations.
- `// @tstyche template` marks a whole file whose default export is generated test text. Keep generation deterministic and ensure the output has useful test names.

Scope matters: a directive above an `expect`, `test`, or `describe` applies there; a file-level directive must be at the top. A misplaced directive is ordinary comment text.

## Type-test hygiene

- Keep dedicated type tests isolated with `noEmit: true`, `strict: true`, `types: []`, an explicit `include`, and an empty `exclude` where the project layout permits.
- Use `.tsx` for JSX assertions and enable the required `jsx` compiler option. Enable decorator options for `toBeApplicable` examples.
- Type tests are analyzed, not executed. Runtime setup belongs in a unit test, while assertions can be included in unit tests only when `testFileMatch` intentionally includes those files.
