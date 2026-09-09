# Layout and TSConfig

The live references are https://tstyche.org/project/file-structure and https://tstyche.org/project/compiler-options.

## Layouts

Prefer a dedicated directory:

```text
src/
  __typetests__/
    api.tst.ts
    tsconfig.json
```

Shared `__tests__` directories and tests next to source files are supported. If tests are adjacent, use a separate test project/reference so production compilation does not include type-test files accidentally.

## Isolated test TSConfig

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "noEmit": true, "strict": true, "types": [] },
  "include": ["**/*"],
  "exclude": []
}
```

Adjust relative paths to the actual directory. `types: []` prevents ambient `@types/*` packages from changing the test environment. Add `jsx` and decorator-related options only when those features are tested.

TSTyche reads the selected TSConfig through `findup` by default; `baseline` deliberately skips project config. Confirm the actual config with `--showConfig` and the output's `uses TypeScript ... with ...` line.
