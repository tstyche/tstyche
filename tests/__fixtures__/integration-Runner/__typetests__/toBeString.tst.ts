import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

test.skip("is skipped?", () => {
  expect<string>().type.toBe<string>();
  expect<number>().type.toBe<string>();
});

expect<string>().type.toBe<string>();
expect.skip<number>().type.toBe<string>();

test("is NOT string?", () => {
  expect<number>().type.toBe<string>();
});

test.todo("to be implemented?", () => {
  expect<number>().type.toBe<string>();
});
