import { describe, expect, test } from "tstyche";

describe.skip("is skipped describe?", () => {
  const a: string = 123;

  test("is skipped?", () => {
    const b: number = "abc";

    expect<string>().type.toBeString();
  });
});

describe("is parent describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });

  describe.skip("is nested skipped describe?", function() {
    test.skip("is skipped too?", () => {
      expect<string>().type.toBeString();
    });

    test.todo("is todo?");
  });

  test.todo("is todo?");
});

test("is string still?", () => {
  expect<string>().type.toBeString();
});
