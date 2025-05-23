import { describe, expect, it } from "tstyche";

it("is string?", () => {
  describe("nested 'describe()' is handled?", () => {
    expect<number>().type.toBe<number>();
  });

  it("nested 'it()' is handled?", () => {
    expect<never>().type.toBe<never>();
  });

  expect<string>().type.toBe<string>();
});
