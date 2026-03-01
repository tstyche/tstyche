import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});
