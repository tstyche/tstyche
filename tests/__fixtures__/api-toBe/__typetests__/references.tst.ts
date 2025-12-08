import { expect, test } from "tstyche";

test("edge cases", () => {
  interface A {
    a: unknown;
  }
  interface B<T = unknown> {
    a: T;
  }
  interface C<T = number> {
    a: T;
  }

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

test("Array", () => {
  type A = Array<string>;
  type B = Array<{ b: number }>;

  expect<A>().type.toBe<Array<string>>();
  expect<A>().type.not.toBe<Array<number>>();
  expect<A>().type.not.toBe<ReadonlyArray<string>>();

  expect<B>().type.toBe<Array<{ b: number }>>();
  expect<B>().type.not.toBe<Array<{ b: string }>>();
  expect<B>().type.not.toBe<Array<string>>();
  expect<B>().type.not.toBe<ReadonlyArray<{ b: string }>>();
});

test("ReadonlyArray", () => {
  type A = ReadonlyArray<string>;
  type B = ReadonlyArray<{ b: number }>;

  expect<A>().type.toBe<ReadonlyArray<string>>();
  expect<A>().type.not.toBe<ReadonlyArray<number>>();
  expect<A>().type.not.toBe<Array<string>>();

  expect<B>().type.toBe<ReadonlyArray<{ b: number }>>();
  expect<B>().type.not.toBe<ReadonlyArray<{ b: string }>>();
  expect<B>().type.not.toBe<ReadonlyArray<string>>();
  expect<B>().type.not.toBe<Array<{ b: string }>>();
});

test("Set", () => {
  type A = Set<string>;
  type B = Set<{ b: number }>;

  expect<A>().type.toBe<Set<string>>();
  expect<A>().type.not.toBe<Set<number>>();
  expect<A>().type.not.toBe<ReadonlySet<string>>();

  expect<B>().type.toBe<Set<{ b: number }>>();
  expect<B>().type.not.toBe<Set<{ b: string }>>();
  expect<B>().type.not.toBe<Set<string>>();
  expect<B>().type.not.toBe<ReadonlySet<{ b: string }>>();
});

test("ReadonlySet", () => {
  type A = ReadonlySet<string>;
  type B = ReadonlySet<{ b: number }>;

  expect<A>().type.toBe<ReadonlySet<string>>();
  expect<A>().type.not.toBe<ReadonlySet<number>>();
  expect<A>().type.not.toBe<Set<string>>();

  expect<B>().type.toBe<ReadonlySet<{ b: number }>>();
  expect<B>().type.not.toBe<ReadonlySet<{ b: string }>>();
  expect<B>().type.not.toBe<ReadonlySet<string>>();
  expect<B>().type.not.toBe<Set<{ b: string }>>();
});

test("Map", () => {
  type A = Map<string, number>;
  type B = Map<string, { b: number }>;

  expect<A>().type.toBe<Map<string, number>>();
  expect<A>().type.not.toBe<Map<string, string>>();
  expect<A>().type.not.toBe<ReadonlyMap<string, { b: number }>>();

  expect<B>().type.toBe<Map<string, { b: number }>>();
  expect<B>().type.not.toBe<Map<string, { b: string }>>();
  expect<B>().type.not.toBe<Map<string, number>>();
  expect<B>().type.not.toBe<ReadonlyMap<string, { b: number }>>();
});

test("ReadonlyMap", () => {
  type A = ReadonlyMap<string, number>;
  type B = ReadonlyMap<string, { b: number }>;

  expect<A>().type.toBe<ReadonlyMap<string, number>>();
  expect<A>().type.not.toBe<ReadonlyMap<string, string>>();
  expect<A>().type.not.toBe<Map<string, number>>();

  expect<B>().type.toBe<ReadonlyMap<string, { b: number }>>();
  expect<B>().type.not.toBe<ReadonlyMap<string, { b: string }>>();
  expect<B>().type.not.toBe<ReadonlyMap<string, number>>();
  expect<B>().type.not.toBe<Map<string, { b: number }>>();
});

test("Promise", () => {
  type A = Promise<void>;
  type B = Promise<{ b: string }>;

  expect<A>().type.toBe<Promise<void>>();
  expect<A>().type.not.toBe<Promise<number>>();
  expect<A>().type.not.toBe<Awaited<void>>();

  expect<B>().type.toBe<Promise<{ b: string }>>();
  expect<B>().type.not.toBe<Promise<{ b: number }>>();
  expect<B>().type.not.toBe<Awaited<{ b: string }>>();
});

test("Awaited", () => {
  type A = Awaited<void>;
  type B = Awaited<{ b: string }>;

  expect<A>().type.toBe<void>();
  expect<A>().type.toBe<Awaited<void>>();
  expect<A>().type.not.toBe<Awaited<number>>();
  expect<A>().type.not.toBe<Promise<void>>();

  expect<B>().type.toBe<{ b: string }>();
  expect<B>().type.toBe<Awaited<{ b: string }>>();
  expect<B>().type.not.toBe<Awaited<{ b: number }>>();
  expect<B>().type.not.toBe<Promise<{ b: string }>>();
});
