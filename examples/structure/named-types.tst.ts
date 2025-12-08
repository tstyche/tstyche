import { expect, test } from "tstyche";

test("edge cases", () => {
  type A = {
    a: unknown;
  };
  interface B<T = unknown> {
    a: T;
  }
  type C<T = number> = {
    a: T;
  };

  expect<A>().type.toBe<B>();
  expect<A>().type.toBe<C<unknown>>();
  expect<A>().type.not.toBe<C>();

  expect<B<number>>().type.toBe<C>();
  expect<B>().type.toBe<C<unknown>>();
  expect<B<string>>().type.toBe<C<string>>();

  expect<C<unknown>>().type.toBe<B>();
  expect<C>().type.toBe<B<number>>();
  expect<C<string>>().type.toBe<B<string>>();
});

test("recursive types", () => {
  interface A<T> {
    value: T;
    left: B<T> | null;
    right: B<T> | null;
  }

  type B<T> = {
    value: T;
    left: A<T> | null;
    right: A<T> | null;
  };

  expect<A<number>>().type.toBe<B<number>>();
  expect<B<number>>().type.toBe<A<number>>();

  expect<A<null>>().type.toBe<B<null>>();
  expect<B<null>>().type.toBe<A<null>>();
});
