// @tstyche
// @tstyche-

// @tstyche nope
// @tstyche-nope

import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
  expect<number>().type.not.toBe<string>();
});
