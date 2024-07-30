import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

test.skip("skipped type error?", () => {
  expect<string>().toBeString();
});

test("reported type error?", () => {
  expect<string>().toBeString();
});
