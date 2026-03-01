import { expect, test } from "tstyche";

test("edge cases", () => {
  expect<string | any>().type.toBe<any>();
  expect<{ a: string } | any>().type.toBe<any>();

  expect<string | unknown>().type.toBe<unknown>();
  expect<{ a: string } | unknown>().type.toBe<unknown>();

  expect<string | never>().type.toBe<string>();
  expect<{ a: string } | never>().type.toBe<{ a: string }>();

  expect<boolean>().type.toBe<true | false>();
  expect<true | false>().type.toBe<boolean>();
});

test("objects", () => {
  expect<{ a: string } | { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } | { b: string }>().type.not.toBe<{ a: string }>();

  expect<{ a: string }>().type.toBe<{ a: string } | { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } | { b: string }>();

  expect<{ a: string } | { a: string; b: number } | { a: string; b: number }>().type.toBe<
    { a: string } | { a: string; b: number }
  >();
  expect<{ a: string } | { a: string; b: number }>().type.toBe<
    { a: string } | { a: string; b: number } | { a: string; b: number }
  >();
});

test("call signatures", () => {
  type A = (a: string, b: string) => string;
  type B = (a: number, b: number) => number;

  expect<A | B>().type.toBe<((a: string, b: string) => string) | ((a: number, b: number) => number)>();
  expect<A | B>().type.not.toBe<{
    (a: string, b: string): string;
    (a: number, b: number): number;
  }>();

  expect<A | B>().type.toBe<B | A>();
  expect<A | B>().type.toBe<((a: number, b: number) => number) | ((a: string, b: string) => string)>();
});
