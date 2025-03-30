import { describe, expect, test } from "tstyche";

describe("is describe?", () => {
  test("is void?", () => {
    expect<void>().type.toBe<void>();
  });
});

describe("is parent describe?", () => {
  test("is never?", () => {
    expect<never>().type.toBe<never>();
  });

  describe("is nested describe?", function () {
    test("is string?", () => {
      expect<string>().type.toBe<string>();
    });
  });
});

test("is string still?", () => {
  expect<string>().type.toBe<string>();
});
