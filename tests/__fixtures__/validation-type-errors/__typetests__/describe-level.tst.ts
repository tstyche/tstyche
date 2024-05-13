import { describe, expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

describe.skip("skipped type error?", () => {
  test("with type error", () => {
    expect<string>().toBeString();
  });
});

describe("reported type error?", () => {
  test("with type error");

  test("looks at this test?", () => {
    expect<number>().type.toBeNumber();
  });
});

test("continues to run tests?", () => {
  expect<number>().type.toBeNumber();
});
