import { expect, test } from "tstyche";

test("signatures", () => {
  type A = <T extends string>() => `a-${T}`;
  type B = <T extends number>() => `b-${T}`;
  type C = <T extends string>() => `a-${T}-${T}`;

  expect<A>().type.toBe<<T extends string>() => `a-${T}`>();
  expect<A>().type.not.toBe<<T extends number>() => `a-${T}`>();
  expect<A>().type.not.toBe<<T extends number>() => number>();

  expect<B>().type.toBe<<T extends number>() => `b-${T}`>();
  expect<B>().type.not.toBe<<T extends string>() => `b-${T}`>();
  expect<B>().type.not.toBe<<T extends string>() => string>();

  expect<A>().type.not.toBe<B>();
  expect<B>().type.not.toBe<A>();

  expect<C>().type.toBe<<T extends string>() => `a-${T}-${T}`>();
  expect<C>().type.not.toBe<<T extends number>() => `a-${T}-${T}`>();
  expect<C>().type.not.toBe<<T extends string>() => `a-${T}`>();
});

test("element types", () => {
  type A = `a-${string}`;
  type B = `b-${number}`;

  expect<A>().type.toBe<`a-${string}`>();
  expect<A>().type.not.toBe<`b-${string}`>();
  expect<A>().type.not.toBe<`a-${number}`>();

  expect<B>().type.toBe<`b-${number}`>();
  expect<B>().type.not.toBe<`a-${number}`>();
  expect<B>().type.not.toBe<`b-${string}`>();
});
