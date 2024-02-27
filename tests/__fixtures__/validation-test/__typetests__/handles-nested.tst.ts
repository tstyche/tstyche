import { describe, expect, test } from "tstyche";

test("is string?", () => {
  describe("nested describe is handled?", () => {
    expect<number>().type.toBeNumber();
  });

  test("nested test is handled?", () => {
    expect<never>().type.toBeNever();
  });

  expect<string>().type.toBeString();
});
