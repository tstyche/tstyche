import { describe, expect, test } from "tstyche";

describe("is describe?", () => {
  test("is void?", () => {
    expect<void>().type.toBeVoid();
  });
});

describe("is parent describe?", () => {
  test("is never?", () => {
    expect<never>().type.toBeNever();
  });

  describe("is nested describe?", function () {
    test("is string?", () => {
      expect<string>().type.toBeString();
    });
  });
});

test("is string still?", () => {
  expect<string>().type.toBeString();
});
