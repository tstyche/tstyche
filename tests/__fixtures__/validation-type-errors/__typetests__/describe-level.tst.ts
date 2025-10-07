import { describe, expect, test } from "tstyche";

let a: string;

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

describe.skip("skipped type error?", () => {
  a = 123;

  test("with type error", () => {
    expect<string>().type.toBe<string>();
  });
});

describe("reported type error?", () => {
  a = false;

  test("looks at this test?", () => {
    expect<number>().type.toBe<number>();
  });
});

test("continues to run tests?", () => {
  expect<number>().type.toBe<number>();
});
