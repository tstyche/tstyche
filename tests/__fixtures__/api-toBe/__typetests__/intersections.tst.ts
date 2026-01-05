import { expect, test } from "tstyche";

test("edge cases", () => {
  expect<string & any>().type.toBe<any>();
  expect<{ a: string } & any>().type.toBe<any>();

  expect<string & unknown>().type.toBe<string>();
  expect<{ a: string } & unknown>().type.toBe<{ a: string }>();

  expect<string & never>().type.toBe<never>();
  expect<{ a: string } & never>().type.toBe<never>();

  expect<string & number>().type.toBe<never>();
});

test("branding", () => {
  type X = number & { readonly brand: unique symbol };
  type Y = number & { readonly brand: unique symbol };

  type A = number & { brand: void };
  type B = number & { brand: void };
  type C = { brand: void } & number;
  type D = { brand: void } & string;

  expect<X>().type.not.toBe<Y>();

  expect<A>().type.toBe<B>();
  expect<A>().type.toBe<C>();

  expect<C>().type.not.toBe<D>();
});

test("objects", () => {
  expect<{ a: string } & { b: number }>().type.toBe<{ a: string; b: number }>();
  expect<{ a: string } & { b: number }>().type.not.toBe<{ a: string }>();

  expect<{ a: string; b: number }>().type.toBe<{ a: string } & { b: number }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } & { b: number }>();

  expect<{ a: { b: string } & { c: number } }>().type.toBe<{ a: { b: string; c: number } }>();
  expect<{ a: { b: string } & { c: number } }>().type.not.toBe<{ a: { b: string } }>();

  expect<() => () => () => () => string>().type.not.toBe<() => () => () => () => number>();
  expect<() => () => () => { a: string } & { b: number }>().type.toBe<() => () => () => { a: string; b: number }>();
});

test("call signatures", () => {
  type A = (a: string, b: string) => string;
  type B = (a: number, b: number) => number;

  expect<A & B>().type.toBe<((a: string, b: string) => string) & ((a: number, b: number) => number)>();
  expect<A & B>().type.toBe<{
    (a: string, b: string): string;
    (a: number, b: number): number;
  }>();

  expect<A & B>().type.not.toBe<B & A>();
  expect<A & B>().type.not.toBe<((a: number, b: number) => number) & ((a: string, b: string) => string)>();
  expect<A & B>().type.not.toBe<{
    (a: number, b: number): number;
    (a: string, b: string): string;
  }>();
});

test("generic types", () => {
  type WithLoading<T> = T & { loading: boolean };
  type WithDefault<T = () => unknown> = T & (() => boolean);

  expect<WithLoading<number>>().type.toBe<number & { loading: boolean }>();
  expect<WithLoading<number>>().type.toBe<{ loading: boolean } & number>();

  expect<WithLoading<{ a: number }>>().type.toBe<{ a: number } & { loading: boolean }>();
  expect<WithLoading<{ a: number }>>().type.toBe<{ loading: boolean } & { a: number }>();

  expect<WithDefault>().type.toBe<(() => unknown) & (() => boolean)>();
  expect<WithDefault>().type.not.toBe<(() => boolean) & (() => unknown)>();

  expect<WithDefault<() => void>>().type.toBe<(() => void) & (() => boolean)>();
  expect<WithDefault<() => void>>().type.not.toBe<(() => boolean) & (() => void)>();

  expect<WithDefault<unknown>>().type.toBe<unknown & (() => boolean)>();
  expect<WithDefault<unknown>>().type.toBe<(() => boolean) & unknown>();
});

test("mapped types", () => {
  type Flags = { [K in "featureA" | "featureB"]: boolean } & { enabled: boolean };

  expect<Flags>().type.toBe<{ enabled: boolean; featureA: boolean; featureB: boolean }>();
  expect<Flags>().type.toBe<{ enabled: boolean } & { featureA: boolean } & { featureB: boolean }>();
});

test("type parameter", () => {
  type A = <T>() => T & {};
  type B = <T>() => NonNullable<T>;

  expect<A>().type.toBe<<T>() => T & {}>();
  expect<A>().type.not.toBe<<T>() => T>();

  expect<B>().type.toBe<<T>() => NonNullable<T>>();
  expect<B>().type.not.toBe<<T>() => T>();

  expect<A>().type.toBe<B>();
  expect<B>().type.toBe<A>();
});

test("index", () => {
  type A = <T>() => keyof T & {};

  expect<A>().type.toBe<<T>() => keyof T & {}>();
  expect<A>().type.not.toBe<<T>() => keyof T>();
});

test("indexed access", () => {
  type A = <T>(a: Partial<T>[keyof T] & {}) => void;
  type B = <T>(a: NonNullable<Partial<T>[keyof T]>) => void;

  expect<A>().type.toBe<<T>(a: Partial<T>[keyof T] & {}) => void>();
  expect<A>().type.not.toBe<<T>(a: Partial<T>[keyof T]) => void>();

  expect<B>().type.toBe<<T>(a: NonNullable<Partial<T>[keyof T]>) => void>();
  expect<B>().type.not.toBe<<T>(a: Partial<T>[keyof T]) => void>();

  expect<A>().type.toBe<B>();
  expect<B>().type.toBe<A>();
});

test("conditional", () => {
  type A = <T>() => Extract<T, { kind: "circle" }> & {};
  type B = <T>() => NonNullable<Extract<T, { kind: "circle" }>>;

  expect<A>().type.toBe<<T>() => Extract<T, { kind: "circle" }> & {}>();
  expect<A>().type.not.toBe<<T>() => Extract<T, { kind: "circle" }>>();

  expect<B>().type.toBe<<T>() => NonNullable<Extract<T, { kind: "circle" }>>>();
  expect<B>().type.not.toBe<<T>() => Extract<T, { kind: "circle" }>>();

  expect<A>().type.toBe<B>();
  expect<B>().type.toBe<A>();
});

test("substitution", () => {
  type A = <T>(a: NoInfer<T> & {}) => void;
  type B = <T>(a: NonNullable<NoInfer<T>>) => void;

  expect<A>().type.toBe<<T>(a: NoInfer<T> & {}) => void>();
  expect<A>().type.not.toBe<<T>(a: NoInfer<T>) => void>();

  expect<B>().type.toBe<<T>(a: NonNullable<NoInfer<T>>) => void>();
  expect<B>().type.not.toBe<<T>(a: NoInfer<T>) => void>();

  expect<A>().type.toBe<B>();
  expect<B>().type.toBe<A>();
});

test("template literal", () => {
  type A = <T extends string>() => `__${T}__`;
  type B = <T extends string>() => `__${T}__` & { readonly brand: unique symbol };
  type C = <T extends number>() => `__${T}__` & { readonly brand: unique symbol };

  expect<A>().type.not.toBe<B>();
  expect<B>().type.not.toBe<C>();
});

test("string mapping", () => {
  type D = <T extends string>() => Uppercase<T>;
  type E = <T extends string>() => Uppercase<T> & { readonly brand: unique symbol };
  type F = <T extends string>() => Lowercase<T> & { readonly brand: unique symbol };

  expect<D>().type.not.toBe<E>();
  expect<E>().type.not.toBe<F>();
});
