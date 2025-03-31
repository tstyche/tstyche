import { describe, expect, test } from "tstyche";

describe("is skipped describe?", () => {
  const a: string = 123;

  test("is skipped?", () => {
    const b: number = "abc";

    expect<void>().type.toBe<void>();
  });
});

describe.only("is only describe?", () => {
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  test.skip("is skipped?", () => {
    expect<never>().type.toBe<never>();
  });

  test.todo("is todo?");

  test.only("is string?", () => {
    expect<string>().type.toBe<string>();
  });

  describe("is nested describe?", function () {
    test("is string?", () => {
      expect<string>().type.toBe<string>();
    });

    test.skip("is skipped?", () => {
      expect<never>().type.toBe<never>();
    });
  });

  describe.only("is nested only describe?", function () {
    test("is string?", () => {
      expect<string>().type.toBe<string>();
    });

    test.todo("is todo?");
  });

  describe.skip("is nested skipped describe?", function () {
    test("is skipped?", () => {
      expect<string>().type.toBe<string>();
    });

    test.only("is skipped?", () => {
      expect<never>().type.toBe<never>();
    });
  });
});

test("is skipped?", () => {
  expect<string>().type.toBe<string>();
});
