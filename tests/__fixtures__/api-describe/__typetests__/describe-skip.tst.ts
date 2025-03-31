import { describe, expect, test } from "tstyche";

describe.skip("is skipped describe?", () => {
  const a: string = 123;

  test("is skipped?", () => {
    const b: number = "abc";

    expect<string>().type.toBe<string>();
  });
});

describe("is parent describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });

  describe.skip("is nested skipped describe?", function () {
    test.skip("is skipped too?", () => {
      expect<string>().type.toBe<string>();
    });

    test.todo("is todo?");
  });

  test.todo("is todo?");
});

test("is string still?", () => {
  expect<string>().type.toBe<string>();
});
