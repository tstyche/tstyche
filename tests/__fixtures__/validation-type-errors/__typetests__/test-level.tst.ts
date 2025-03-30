import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

test.skip("skipped type error?", () => {
  expect<string>().toBe<string>();
});

test("reported type error?", () => {
  expect<string>().toBe<string>();
});
