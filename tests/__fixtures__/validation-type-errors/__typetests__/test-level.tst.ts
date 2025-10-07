import { expect, test } from "tstyche";

let a: string;

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

test.skip("skipped type error?", () => {
  a = 123;

  expect<string>().type.toBe<string>();
});

test("reported type error?", () => {
  a = false;

  expect<string>().type.toBe<string>();
});
