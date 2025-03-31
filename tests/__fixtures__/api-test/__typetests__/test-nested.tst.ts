import { describe, expect, test } from "tstyche";

test("is string?", () => {
  describe("nested describe is handled?", () => {
    expect<number>().type.toBe<number>();
  });

  test("nested test is handled?", () => {
    expect<never>().type.toBe<never>();
  });

  expect<string>().type.toBe<string>();
});
