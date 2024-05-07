import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

test("is NOT string?", () => {
  expect<number>().type.toBeString();
});
