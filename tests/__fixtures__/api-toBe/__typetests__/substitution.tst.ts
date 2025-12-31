import { expect, test } from "tstyche";

test("signatures", () => {
  interface UserProfile {
    age: number | undefined;
    name: string | undefined;
  }

  type S<T extends string> = T;
  type N<T extends number> = T;

  type A = <T>() => T extends UserProfile ? (T["name"] extends string ? S<T["name"]> : never) : never;
  type B = <T>() => T extends UserProfile ? (T["age"] extends number ? N<T["age"]> : never) : never;

  expect<A>().type.toBe<<T>() => T extends UserProfile ? (T["name"] extends string ? S<T["name"]> : never) : never>();
  expect<A>().type.not.toBe<<T>() => T extends UserProfile ? (T["name"] extends string ? string : never) : never>();

  expect<B>().type.toBe<<T>() => T extends UserProfile ? (T["age"] extends number ? N<T["age"]> : never) : never>();
  expect<B>().type.not.toBe<<T>() => T extends UserProfile ? (T["age"] extends number ? number : never) : never>();

  expect<A>().type.not.toBe<B>();
  expect<B>().type.not.toBe<A>();
});

test("NoInfer", () => {
  type A = <T>(value: NoInfer<T>) => T;
  type B = <T>(value: T) => T;

  const a = <T>(value: NoInfer<T>) => value;
  const b = <T>(value: T) => value;

  expect<A>().type.toBe<<T>(value: NoInfer<T>) => T>();
  expect<A>().type.not.toBe<<T>(value: T) => T>();
  expect(a).type.toBe<<T>(value: NoInfer<T>) => T>();
  expect(a).type.not.toBe<<T>(value: T) => T>();

  expect<B>().type.toBe<<T>(value: T) => T>();
  expect<B>().type.not.toBe<<T>(value: NoInfer<T>) => T>();
  expect(b).type.toBe<<T>(value: T) => T>();
  expect(b).type.not.toBe<<T>(value: NoInfer<T>) => T>();

  expect(a("abc")).type.toBe<unknown>();
  expect(b("abc")).type.toBe<"abc">();

  expect<A>().type.not.toBe<B>();
  expect<B>().type.not.toBe<A>();
});

test("nested 'NoInfer'", () => {
  type A = <S extends string>(config: { initial: NoInfer<S>; states: Array<S> }) => S;
  type B = <S extends string>(config: { initial: S; states: Array<S> }) => S;

  expect<A>().type.toBe<<S extends string>(config: { initial: NoInfer<S>; states: Array<S> }) => S>();
  expect<A>().type.not.toBe<<S extends string>(config: { initial: S; states: Array<S> }) => S>();

  expect<B>().type.toBe<<S extends string>(config: { initial: S; states: Array<S> }) => S>();
  expect<B>().type.not.toBe<<S extends string>(config: { initial: NoInfer<S>; states: Array<S> }) => S>();

  expect<A>().type.not.toBe<B>();
  expect<B>().type.not.toBe<A>();
});
