import { expect, test, when } from "tstyche";

test("the final element must be an action", () => {
  when();

  expect<string>().type.toBe<string>();
});

test("must be called with an argument", () => {
  when().isCalledWith;

  expect<string>().type.toBe<string>();
});
