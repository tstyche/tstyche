import { describe, expect, it } from "tstyche";

it("is string?", () => {
  describe("nested describe is handled?", () => {
    expect<number>().type.toBeNumber();
  });

  it("nested it is handled?", () => {
    expect<never>().type.toBeNever();
  });

  expect<string>().type.toBeString();
});
