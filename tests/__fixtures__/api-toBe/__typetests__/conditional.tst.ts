import { expect, test } from "tstyche";

test("edge cases", () => {
  type A = <T>(a: T) => T extends Array<infer U> ? U : unknown;

  expect<A>().type.toBe<<T>(a: T) => T extends Array<infer U> ? U : unknown>();

  expect<A>().type.not.toBe<<T>(a: T) => T extends [infer U] ? U : unknown>();
  expect<A>().type.not.toBe<<T>(a: T) => T extends infer U ? U : unknown>();
  expect<A>().type.not.toBe<<T>(a: T) => T extends Array<infer U> ? U : never>();
});

test("inferred", () => {
  type ReturnType<T> = T extends (...args: any) => infer R ? R : never;

  expect<ReturnType<() => void>>().type.toBe<void>();
});

test("distributive", () => {
  type ToArray<T> = T extends any ? Array<T> : never;

  expect<ToArray<string | number>>().type.toBe<Array<string> | Array<number>>();
});

test("indexed access", () => {
  type Flatten<T> = T extends Array<any> ? T[number] : T;

  expect<Flatten<Array<string>>>().type.toBe<string>();
  expect<Flatten<number>>().type.toBe<number>();
});

test("tuple manipulation", () => {
  type Tail<T extends Array<any>> = T extends [any, ...infer Rest] ? Rest : never;

  expect<Tail<[1, 2, 3]>>().type.toBe<[2, 3]>();
});

test("branding", () => {
  type Brand<K, T> = K & { __brand: T };

  expect<Brand<number, "id">>().type.toBe<number & { __brand: "id" }>();
});

test("key lookup", () => {
  type ValueAtKeyA<T, K extends PropertyKey, FallBack = unknown> = K extends keyof T ? T[K] : FallBack;
  type ValueAtKeyB<T, K extends string | number, FallBack = unknown> = K extends keyof T ? T[K] : FallBack;

  function get<K extends PropertyKey>(key: K): <T>(a: T) => ValueAtKeyA<T, K> {
    return (a) => undefined as ValueAtKeyA<typeof a, K>;
  }

  expect(get("length")).type.toBe<<T>(a: T) => ValueAtKeyA<T, "length">>();
  expect(get("length")).type.not.toBe<<T>(a: T) => ValueAtKeyB<T, "length">>();
});

test("recursive", () => {
  type A = {
    a: number;
    b: { c: string };
  };

  type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
  };

  expect<DeepPartial<A>>().type.toBe<{
    a?: number;
    b?: { c?: string };
  }>();

  type DeepReadonly<T> = T extends (...args: any) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

  expect<DeepReadonly<A>>().type.toBe<{
    readonly a: number;
    readonly b: { readonly c: string };
  }>();
});
