import { describe, expect, test } from "tstyche";

expect<string>().type.toBe<string>();

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
  });
});

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
  });
});

test.only("is number?", () => {
  expect.skip<string>().type.toBe<number>();
});

test("is skipped?", () => {
  expect<never>().type.toBe<string>();
});

test.todo("is todo?");
