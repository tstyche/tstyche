import { describe, expect, test } from "tstyche";

type One = () => void;
declare const one: One;

expect<string>().type.toBe<string>();
expect.skip<never>().type.toBe<string>();

expect
  .skip(() => {
    expect<number>().type.toBe<number>();
  })
  .type.toBe<void>();

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
    expect.skip<never>().type.toBe<void>();
  });
});

describe.skip("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
  });
});

test("is number?", () => {
  expect<number>().type.toBe<number>();
  expect.skip<never>().type.toBe<void>();
});

test("is assignable?", () => {
  let a: string | undefined = "abc";
  a = undefined;

  expect.skip(a).type.toBe<void>();
});

test.skip("is skipped?", () => {
  expect<never>().type.toBe<string>();
});

test.todo("is todo?");

test("skips source type error?", () => {
  expect.skip(one("pass")).type.toRaiseError();

  expect.skip(one("fail")).type.toBe<void>();
});

test("skips target type error?", () => {
  expect.skip<void>().type.toBe(one("fail"));
});
