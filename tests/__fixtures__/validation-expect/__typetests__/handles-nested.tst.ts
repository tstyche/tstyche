import { describe, expect, it, test } from "tstyche";

expect(() => {
  describe("cannot be nested", () => {
    //
  });

  it("cannot be nested", () => {
    //
  });

  test("cannot be nested", () => {
    //
  });

  // can be nested!
  expect<number>().type.toBeString();
}).type.toBe<void>();
