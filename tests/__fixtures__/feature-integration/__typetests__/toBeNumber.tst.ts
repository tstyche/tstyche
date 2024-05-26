import { expect, test } from "tstyche";

test("is NOT number?", () => {
  expect<string>().type.toBeNumber();
});

test("is number?", () => {
  expect<number>().type.toBeNumber();
});
