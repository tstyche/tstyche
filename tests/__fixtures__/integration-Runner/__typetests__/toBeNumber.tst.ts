import { expect, test } from "tstyche";

test("is NOT number?", () => {
  expect<string>().type.toBe<number>();
});

test("is number?", () => {
  expect<number>().type.toBe<number>();
});
