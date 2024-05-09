import { expect, test } from "tstyche";

test("is number?", () => {
  expect<number>().type.toBeNumber();
});
