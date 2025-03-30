import { describe, expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

describe.skip("skipped type error?", () => {
  test("with type error", () => {
    expect<string>().toBe<string>();
  });
});

describe("reported type error?", () => {
  test("with type error");

  test("looks at this test?", () => {
    expect<number>().type.toBe<number>();
  });
});

test("continues to run tests?", () => {
  expect<number>().type.toBe<number>();
});
