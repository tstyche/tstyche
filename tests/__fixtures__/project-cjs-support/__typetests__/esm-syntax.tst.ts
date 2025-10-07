import { expect, test } from "tstyche";

test("is supported?", () => {
  expect<void>().type.toBe<void>();
});
