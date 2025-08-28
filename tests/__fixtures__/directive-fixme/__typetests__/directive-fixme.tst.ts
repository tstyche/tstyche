import { describe, expect, test } from "tstyche";

expect<string>().type.toBe<string>();
// @tstyche fixme -- Consider removing the directive
expect<string>().type.toBe<string>();

// @tstyche fixme -- Known bug, see: #345
expect<never>().type.toBe<string>();
expect<string>().type.toBe<string>();

// @tstyche fixme -- This should work, see: #265
expect(() => {
  expect<number>().type.toBe<number>();
}).type.toBe<void>();

test("is number?", () => {
  expect<number>().type.toBe<number>();
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  // @tstyche fixme
  expect<never>().type.toBe<void>();
  expect<string>().type.toBe<string>();
});

// @tstyche fixme -- Consider removing the directive
test("is NOT fixme?", () => {
  expect<number>().type.toBe<number>();
});

// @tstyche fixme
test("is fixme?", () => {
  expect<number>().type.toBe<number>();
  expect<never>().type.toBe<void>();
  expect<string>().type.toBe<string>();
});

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
    // @tstyche fixme -- Consider removing the directive
    expect<string>().type.toBe<string>();

    // @tstyche fixme
    expect<never>().type.toBe<void>();
    expect<string>().type.toBe<string>();
  });
});
