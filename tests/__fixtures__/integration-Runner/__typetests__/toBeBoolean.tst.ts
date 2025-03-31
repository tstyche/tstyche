import { expect, test } from "tstyche";

test("is NOT boolean?", () => {
  expect<string>().type.toBe<boolean>();
});

test("is boolean?", () => {
  expect<boolean>().type.toBe<boolean>();
});
