import { expect, test, when } from "tstyche";

test("must be called with an argument", () => {
  when().isCalledWith;

  expect<string>().type.toBe<string>();
});
