import { expect, test } from "tstyche";

test("is NOT boolean?", () => {
  expect<string>().type.toBeBoolean();
});

test("is boolean?", () => {
  expect<boolean>().type.toBeBoolean();
});
