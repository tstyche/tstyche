import { expect, test } from "tstyche";

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

test("index signatures", () => {
  interface StringArray {
    [index: number]: string;
  }

  interface ReadonlyStringArray {
    readonly [index: number]: string;
  }

  type MultiIndex = {
    [key: string]: string | number;
    [key: number]: string;
  };

  expect<StringArray>().type.toBe<{ [index: number]: string }>();
  expect<StringArray>().type.not.toBe<{ [index: string]: string }>();
  expect<StringArray>().type.not.toBe<{ [index: number]: number }>();

  expect<ReadonlyStringArray>().type.toBe<{ readonly [index: number]: string }>();
  expect<ReadonlyStringArray>().type.not.toBe<{ readonly [index: string]: string }>();
  expect<ReadonlyStringArray>().type.not.toBe<{ readonly [index: number]: number }>();

  expect<MultiIndex>().type.toBe<{ [key: string]: string | number; [key: number]: string }>();
  expect<MultiIndex>().type.not.toBe<{ [key: string]: string | number }>();
  expect<MultiIndex>().type.not.toBe<{ [key: number]: string }>();
});

test("symbol keys", () => {
  const aSym = Symbol.for("a");
  const bSym = Symbol.for("b");
  const cSym = Symbol.for("c");

  type A = { [aSym]: string };
  type B = { [bSym]?: number };
  type C = { readonly [bSym]: number };
  type D = { [aSym]: string; [bSym]: number; [cSym]: boolean };

  expect<A>().type.toBe<{ [aSym]: string }>();
  expect<A>().type.not.toBe<{ [bSym]: string }>();

  expect<B>().type.toBe<{ [bSym]?: number }>();
  expect<B>().type.not.toBe<{ [cSym]?: number }>();

  expect<C>().type.toBe<{ readonly [bSym]: number }>();
  expect<C>().type.not.toBe<{ readonly [cSym]: number }>();

  expect<D>().type.toBe<{ [aSym]: string; [bSym]: number; [cSym]: boolean }>();
});
