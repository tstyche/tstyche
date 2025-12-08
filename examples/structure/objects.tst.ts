import { expect, test } from "tstyche";

// TODO symbol keys
// TODO well known symbols

test("edge cases", () => {
  expect(Date).type.toBe<typeof Date>();

  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.not.toBe<{ a: string }>();

  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>();
  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>();
});

test("optional", () => {
  interface A {
    a?: string;
  }
  interface B {
    readonly a?: string;
  }
  interface C {
    readonly a?: { b?: string };
  }
  interface D {
    a?: { readonly b?: string };
  }
  interface E {
    readonly a?: { readonly b?: string };
  }

  expect<A>().type.toBe<{ a?: string }>();
  expect<A>().type.not.toBe<{ a: string }>();

  expect<B>().type.toBe<{ readonly a?: string }>();
  expect<B>().type.not.toBe<{ readonly a: string }>();

  expect<C>().type.toBe<{ readonly a?: { b?: string } }>();
  expect<C>().type.not.toBe<{ readonly a?: { b: string } }>();

  expect<D>().type.toBe<{ a?: { readonly b?: string } }>();
  expect<D>().type.not.toBe<{ a?: { readonly b: string } }>();

  expect<E>().type.toBe<{ readonly a?: { readonly b?: string } }>();
  expect<E>().type.not.toBe<{ readonly a?: { readonly b: string } }>();
});

test("readonly", () => {
  interface A {
    readonly a: string;
  }
  interface B {
    readonly a?: string;
  }
  interface C {
    readonly a: { readonly b: string };
  }
  interface D {
    readonly a: { readonly b?: string };
  }

  expect<A>().type.toBe<{ readonly a: string }>();
  expect<A>().type.not.toBe<{ a: string }>();

  expect<B>().type.toBe<{ readonly a?: string }>();
  expect<B>().type.not.toBe<{ a?: string }>();

  expect<C>().type.toBe<{ readonly a: { readonly b: string } }>();
  expect<C>().type.not.toBe<{ readonly a: { b: string } }>();

  expect<D>().type.toBe<{ readonly a: { readonly b?: string } }>();
  expect<D>().type.not.toBe<{ readonly a: { b?: string } }>();
});
