import { expect, test } from "tstyche";

test("edge cases", () => {
  class A<T> {
    [key: number]: T;
  }

  expect<A<string>>().type.not.toBe<Array<string>>();
  expect<Array<string>>().type.not.toBe<A<string>>();

  // biome-ignore lint/style/useNamingConvention: test
  interface toArray<T> {
    value: T;
  }
  function toArray<T>(a: T): Array<T> {
    return [a];
  }
  // biome-ignore lint/style/useNamingConvention: test
  interface toArrayString extends toArray<string> {}

  expect<{ a: toArrayString }>().type.toBe<{ a: toArray<string> }>();
});

test("NoInfer", () => {
  expect<{ a: string }>().type.toBe<NoInfer<{ a: string }>>();
  expect<Array<{ a: string }>>().type.toBe<NoInfer<Array<{ a: string }>>>();
  expect<<T>(value: T) => T>().type.toBe<<T>(value: NoInfer<T>) => T>();
});

test("Array", () => {
  type A = Array<string>;
  type B = Array<{ b: number }>;
  type C = Array<string> & { x: boolean };

  expect<A>().type.toBe<Array<string>>();
  expect<A>().type.not.toBe<Array<number>>();
  expect<A>().type.not.toBe<ReadonlyArray<string>>();

  expect<B>().type.toBe<Array<{ b: number }>>();
  expect<B>().type.not.toBe<Array<{ b: string }>>();
  expect<B>().type.not.toBe<Array<string>>();
  expect<B>().type.not.toBe<ReadonlyArray<{ b: string }>>();

  expect<C>().type.toBe<Array<string> & { x: boolean }>();
  expect<C>().type.not.toBe<Array<number> & { x: boolean }>();
  expect<C>().type.not.toBe<Array<string> & { y: boolean }>();
  expect<C>().type.not.toBe<Array<string> & { x: string }>();
});

test("ReadonlyArray", () => {
  type A = ReadonlyArray<string>;
  type B = ReadonlyArray<{ b: number }>;
  type C = ReadonlyArray<string> & { x: boolean };

  expect<A>().type.toBe<ReadonlyArray<string>>();
  expect<A>().type.not.toBe<ReadonlyArray<number>>();
  expect<A>().type.not.toBe<Array<string>>();

  expect<B>().type.toBe<ReadonlyArray<{ b: number }>>();
  expect<B>().type.not.toBe<ReadonlyArray<{ b: string }>>();
  expect<B>().type.not.toBe<ReadonlyArray<string>>();
  expect<B>().type.not.toBe<Array<{ b: string }>>();

  expect<C>().type.toBe<ReadonlyArray<string> & { x: boolean }>();
  expect<C>().type.not.toBe<ReadonlyArray<number> & { x: boolean }>();
  expect<C>().type.not.toBe<ReadonlyArray<string> & { y: boolean }>();
  expect<C>().type.not.toBe<ReadonlyArray<string> & { x: string }>();
});

test("Set", () => {
  type A = Set<string>;
  type B = Set<{ b: number }>;
  type C = Set<string> & { x: boolean };

  expect<A>().type.toBe<Set<string>>();
  expect<A>().type.not.toBe<Set<number>>();
  expect<A>().type.not.toBe<ReadonlySet<string>>();

  expect<B>().type.toBe<Set<{ b: number }>>();
  expect<B>().type.not.toBe<Set<{ b: string }>>();
  expect<B>().type.not.toBe<Set<string>>();
  expect<B>().type.not.toBe<ReadonlySet<{ b: string }>>();

  expect<C>().type.toBe<Set<string> & { x: boolean }>();
  expect<C>().type.not.toBe<Set<number> & { x: boolean }>();
  expect<C>().type.not.toBe<Set<string> & { y: boolean }>();
  expect<C>().type.not.toBe<Set<string> & { x: string }>();
});

test("ReadonlySet", () => {
  type A = ReadonlySet<string>;
  type B = ReadonlySet<{ b: number }>;
  type C = ReadonlySet<string> & { x: boolean };

  expect<A>().type.toBe<ReadonlySet<string>>();
  expect<A>().type.not.toBe<ReadonlySet<number>>();
  expect<A>().type.not.toBe<Set<string>>();

  expect<B>().type.toBe<ReadonlySet<{ b: number }>>();
  expect<B>().type.not.toBe<ReadonlySet<{ b: string }>>();
  expect<B>().type.not.toBe<ReadonlySet<string>>();
  expect<B>().type.not.toBe<Set<{ b: string }>>();

  expect<C>().type.toBe<ReadonlySet<string> & { x: boolean }>();
  expect<C>().type.not.toBe<ReadonlySet<number> & { x: boolean }>();
  expect<C>().type.not.toBe<ReadonlySet<string> & { y: boolean }>();
  expect<C>().type.not.toBe<ReadonlySet<string> & { x: string }>();
});

test("Map", () => {
  type A = Map<string, number>;
  type B = Map<string, { b: number }>;
  type C = Map<string, number> & { x: boolean };

  expect<A>().type.toBe<Map<string, number>>();
  expect<A>().type.not.toBe<Map<string, string>>();
  expect<A>().type.not.toBe<ReadonlyMap<string, { b: number }>>();

  expect<B>().type.toBe<Map<string, { b: number }>>();
  expect<B>().type.not.toBe<Map<string, { b: string }>>();
  expect<B>().type.not.toBe<Map<string, number>>();
  expect<B>().type.not.toBe<ReadonlyMap<string, { b: number }>>();

  expect<C>().type.toBe<Map<string, number> & { x: boolean }>();
  expect<C>().type.not.toBe<Map<string, string> & { x: boolean }>();
  expect<C>().type.not.toBe<Map<string, number> & { y: boolean }>();
  expect<C>().type.not.toBe<Map<string, number> & { x: string }>();
});

test("ReadonlyMap", () => {
  type A = ReadonlyMap<string, number>;
  type B = ReadonlyMap<string, { b: number }>;
  type C = ReadonlyMap<string, number> & { x: boolean };

  expect<A>().type.toBe<ReadonlyMap<string, number>>();
  expect<A>().type.not.toBe<ReadonlyMap<string, string>>();
  expect<A>().type.not.toBe<Map<string, number>>();

  expect<B>().type.toBe<ReadonlyMap<string, { b: number }>>();
  expect<B>().type.not.toBe<ReadonlyMap<string, { b: string }>>();
  expect<B>().type.not.toBe<ReadonlyMap<string, number>>();
  expect<B>().type.not.toBe<Map<string, { b: number }>>();

  expect<C>().type.toBe<ReadonlyMap<string, number> & { x: boolean }>();
  expect<C>().type.not.toBe<ReadonlyMap<string, string> & { x: boolean }>();
  expect<C>().type.not.toBe<ReadonlyMap<string, number> & { y: boolean }>();
  expect<C>().type.not.toBe<ReadonlyMap<string, number> & { x: string }>();
});

test("Promise", () => {
  type A = Promise<void>;
  type B = Promise<{ b: string }>;
  type C = Promise<string> & { x: boolean };

  expect<A>().type.toBe<Promise<void>>();
  expect<A>().type.not.toBe<Promise<number>>();
  expect<A>().type.not.toBe<Awaited<void>>();

  expect<B>().type.toBe<Promise<{ b: string }>>();
  expect<B>().type.not.toBe<Promise<{ b: number }>>();
  expect<B>().type.not.toBe<Awaited<{ b: string }>>();

  expect<C>().type.toBe<Promise<string> & { x: boolean }>();
  expect<C>().type.not.toBe<Promise<number> & { x: boolean }>();
  expect<C>().type.not.toBe<Promise<string> & { y: boolean }>();
  expect<C>().type.not.toBe<Promise<string> & { x: string }>();
});

test("Awaited", () => {
  type A = Awaited<void>;
  type B = Awaited<{ b: string }>;
  type C = Awaited<string> & { x: boolean };

  expect<A>().type.toBe<void>();
  expect<A>().type.toBe<Awaited<void>>();
  expect<A>().type.not.toBe<Awaited<number>>();
  expect<A>().type.not.toBe<Promise<void>>();

  expect<B>().type.toBe<{ b: string }>();
  expect<B>().type.toBe<Awaited<{ b: string }>>();
  expect<B>().type.not.toBe<Awaited<{ b: number }>>();
  expect<B>().type.not.toBe<Promise<{ b: string }>>();

  expect<C>().type.toBe<Awaited<string> & { x: boolean }>();
  expect<C>().type.not.toBe<Awaited<number> & { x: boolean }>();
  expect<C>().type.not.toBe<Awaited<string> & { y: boolean }>();
  expect<C>().type.not.toBe<Awaited<string> & { x: string }>();
});
