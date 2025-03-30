import { describe, expect, test } from "tstyche";

describe.todo("is todo describe?");

describe.todo("is todo describe too?", () => {
  const a: string = 123;

  test("is todo?", () => {
    const b: number = "abc";

    expect(a).type.toBe<string>();
  });
});

describe.skip("is parent skipped describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });

  describe.todo("is nested todo describe?", function () {
    test.only("is todo too?", () => {
      expect<string>().type.toBe<string>();
    });

    test.skip("is todo too?", () => {
      expect<string>().type.toBe<string>();
    });

    test("and this is todo?", () => {
      expect<string>().type.toBe<string>();
    });

    test.todo("is todo?");
  });

  test.todo("is todo?");
});

test.only("is string still?", () => {
  expect<string>().type.toBe<string>();
});
