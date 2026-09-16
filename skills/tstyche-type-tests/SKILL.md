---
name: tstyche-type-tests
description: Write, review, migrate, and debug TSTyche TypeScript type tests, including assertions, helpers, directives, inference-sensitive cases, and compatibility tests.
---

# TSTyche type tests

Use this skill when the task is about a `.tst.*` file, TSTyche assertions or testing helpers, type-level API compatibility, or a type-test failure. TSTyche analyzes TypeScript through the language service; it does not execute test code, so design assertions around the type relationship being checked.

## Workflow

1. Inspect the repository's TSTyche config and test-file TSConfig before editing. Identify the TypeScript targets and whether JSX, decorators, `exactOptionalPropertyTypes`, or other compiler options affect the case.
2. Read only the relevant reference below. Use the package's checked-in declarations as the API source of truth when documentation and implementation disagree.
3. State the intended type relationship, then write both a passing case and a nearby failing/negative case when practical. Keep the type under test on the left side of assignability assertions.
4. Prefer the most specific ability matcher for invalid calls, construction, generic instantiation, properties, JSX props, or decorators. Use `@ts-expect-error` only when the error arises in a broader context the matcher cannot reproduce, and include the expected message when it matters.
5. Run the narrowest target/file first, then the repository's type-test command. For cross-version behavior, use `--target` or an `if` directive rather than silently relying on one installed TypeScript version.

## Core rules

- Import runtime helpers from `tstyche`; import `_` as a type. `pick` and `omit` are type-preserving utility functions used in expressions and can be tested too.
- An assertion is `expect<S>()` or `expect(source)`, followed by `.type` and one matcher. `.not` negates a matcher. Assertion `.only` and `.skip` are available; group/test flags are inherited.
- Helpers are `describe(name, callback)`, `test(name, callback)`, and `it` (an alias of `test`). Names must be string literals because the runner does not execute callbacks. `.todo` makes the callback optional.
- Relation matchers are `.toBe`, `.toBeAssignableFrom`, and `.toBeAssignableTo`; each accepts either a type argument or an expression. Ability matchers are `.toAcceptProps`, `.toBeApplicable`, `.toBeCallableWith`, `.toBeConstructableWith`, `.toBeInstantiableWith`, and `.toHaveProperty`.
- `.toBeApplicable` is used as a decorator and needs decorator compiler support. `.toAcceptProps` needs a `.tsx` test and JSX compiler configuration; object props model JSX attributes and spread props avoid excess-property checks.
- `_` is `never` and fills required generic arguments in `.toBeInstantiableWith<...>()`; that matcher receives a tuple type of type arguments.
- Default `rejectAnyType` and `rejectNeverType` protect inferred/source types from silently becoming `any` or `never`. Explicit `any`/`never` targets remain valid when intentionally tested.
- `.toRaiseError` is deprecated. Preserve it only for compatibility or migration work; prefer the ability matcher that expresses the intended invalid operation.

## Read as needed

- Matcher signatures and semantics: [references/expect-api.md](references/expect-api.md)
- Helpers, modifiers, and directives: [references/testing-and-directives.md](references/testing-and-directives.md)
- Inference and compatibility design: [references/inference-and-compatibility.md](references/inference-and-compatibility.md)
