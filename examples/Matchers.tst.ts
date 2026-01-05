import { type _, expect } from "tstyche";

interface Matchers<R, T = unknown> {
  [key: string]: (expected: T) => R;
}

expect<Matchers<_>>().type.toBeInstantiableWith<[void]>();
expect<Matchers<_>>().type.toBeInstantiableWith<[void, string]>();

expect<Matchers<_>>().type.not.toBeInstantiableWith<[]>();
