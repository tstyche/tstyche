import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

test.skip("is skipped?", () => {
  expect<string>().type.toBeString();
  expect<number>().type.toBeString();
});

expect<string>().type.toBeString();
expect.skip<number>().type.toBeString();

test("is NOT string?", () => {
  expect<number>().type.toBeString();
});

test.todo("to be implemented?", () => {
  expect<number>().type.toBeString();
});
