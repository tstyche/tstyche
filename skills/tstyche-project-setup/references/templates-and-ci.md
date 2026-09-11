# Templates and CI

The live references are https://tstyche.org/guides/template-test-files and https://tstyche.org/guides/typescript-versions.

## Template files

Put `// @tstyche template` at the top of a test file. Export generated type-test source as the default export. Keep generation deterministic, use stable test names, and ensure generated text contains imports and assertions that are valid for every input. Use templates when a matrix of similar cases is clearer than repeated handwritten tests; do not hide materially different expectations in string concatenation.

## CI matrix

- Run a focused single target for pull-request diagnosis.
- Run the supported minimum and relevant latest TypeScript versions, or a range when the package promises compatibility across minor releases.
- Add a scheduled `typescript@next` run for early warnings when maintaining a public type API.
- Cache the TSTyche TypeScript store only when the cache key includes the target/platform inputs; use a writable explicit store path in constrained runners.
- Keep `checkSuppressedErrors`, `rejectAnyType`, and `rejectNeverType` enabled unless the exception is deliberate and documented.

TSTyche tests types statically. Keep runtime assertions in the unit-test runner; use the `testFileMatch` option to include mixed unit/type files only when the project intentionally validates both.
