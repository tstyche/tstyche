# Inference and TypeScript compatibility

Use the live explanation at https://tstyche.org/explanations/type-inference and the version guide at https://tstyche.org/guides/typescript-versions when a test behaves differently across compiler versions.

## Inference checklist

- Decide whether to assert an inferred expression (`expect(expr)`) or a declared type (`expect<Type>()`). Do not accidentally test a widened intermediate when a literal or generic signature is the contract.
- Check optional properties, `exactOptionalPropertyTypes`, contextual typing, overload selection, generic defaults, `NoInfer`, and excess-property checks before changing the expected type.
- For JSX, remember that object props are interpreted as JSX attributes; spread props do not receive excess-property checks.
- For a generic, use `expect<Generic<_>>().type.toBeInstantiableWith<[...args]>()` and keep the tuple's arity explicit.

## Version matrix

TSTyche supports TypeScript `>=5.4` and accepts exact versions, minor-series selectors, distribution tags, and ranges such as `>=5.6` or `>=5.4 <5.6`. TypeScript 7 is not currently supported, so open-ended ranges stop at the current supported upper bound (`6.0`). Use `--target` for local diagnosis and a range in CI when compatibility is part of the package contract.

When compiler behavior or library declarations differ, put the smallest `// @tstyche if { target: ... }` around the affected assertion. Keep both branches meaningful and avoid skipping an entire file when only one declaration changed.

Use positive and negative compatibility cases for every branch. If a new compiler version is released, run the matrix and update the branch only when the package contract intentionally changes.
