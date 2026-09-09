# Expect API reference

Use this file for matcher selection and signature details. The authoritative public declarations are `types/Expect.ts` and `types/index.ts`; the live reference is https://tstyche.org/reference/expect-api.

## Assertion shape

```ts
expect<Source>().type.toBe<Target>();
expect(source).type.toBe(target);
expect<Source>().type.not.toBe<Target>();
```

`expect` may be called with an explicit source type or an expression. `.type` is required before a matcher. Assertion `.only` and `.skip` are properties of `expect` and retain the same call signatures.

## Matchers

| Matcher | Use | Signature |
| --- | --- | --- |
| `toBe` | structural type equality | `<T>()` or `(target: unknown)` |
| `toBeAssignableFrom` | source accepts target | `<T>()` or `(target: unknown)` |
| `toBeAssignableTo` | source is accepted by target | `<T>()` or `(target: unknown)` |
| `toAcceptProps` | JSX component accepts props | `(props: Record<string, unknown>)` |
| `toBeApplicable` | decorator applies to class/member | `(target: unknown, context: DecoratorContext)` |
| `toBeCallableWith` | callable argument list | `(...args: unknown[])` |
| `toBeConstructableWith` | constructable argument list | `(...args: unknown[])` |
| `toBeInstantiableWith` | generic type arguments | `<T extends [...args: unknown[]]>()` |
| `toHaveProperty` | property key exists | `(key: string \| number \| symbol)` |
| `toRaiseError` | legacy error assertion | `(...target: (string \| number \| RegExp)[])` |

Use `.not` immediately before any matcher. For assignability, keep the tested type as the `expect` source; rewrite `expect<T>().type.toBeAssignableFrom(value)` as `expect(value).type.toBeAssignableTo<T>()` only when that is the clearer direction, while preserving the same relationship.

## Matcher selection

- Equality: `toBe`; it compares structural details and distinguishes inference markers such as `NoInfer`.
- Directional compatibility: choose `toBeAssignableFrom` when the expected type is the source contract, or `toBeAssignableTo` when the expression/type under test is the source.
- Invalid invocation: `not.toBeCallableWith` / `not.toBeConstructableWith` / `not.toBeInstantiableWith`.
- Invalid JSX/decorator usage: `not.toAcceptProps` / `not.toBeApplicable`.
- Shape/property presence: `toHaveProperty`.

For a negative assertion, change one input from a positive nearby case. This makes the reason for the expected failure reviewable and protects against accidental pass-through.

## Error expectations

Use an ability matcher when it can isolate the invalid operation. Use `@ts-expect-error` when the diagnostic is produced only by a larger context (for example a composed generic pipeline). With `checkSuppressedErrors` enabled, the text after the directive is checked. Use `...` to truncate unstable portions and append `!` to ignore a directive intentionally. Never use an unqualified directive to hide an unrelated missing symbol or import.
