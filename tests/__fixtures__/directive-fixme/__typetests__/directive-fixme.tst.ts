import { describe, expect, test } from "tstyche";

// @tstyche fixme -- Known bug, see: #345
expect<never>().type.toBe<string>();

expect<string>().type.toBe<string>();
// @tstyche fixme -- Consider removing the directive
expect<string>().type.toBe<string>();

// @tstyche fixme -- This should work, see: #265
expect(() => {
  expect<number>().type.toBe<number>();
}).type.toBe<void>();

// @tstyche fixme
test("is fixme?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  expect<never>().type.toBe<number>(); // silenced fail
  expect<string>().type.toBe<string>();
});

// @tstyche fixme -- Consider removing the directive
test("is number?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  // @tstyche fixme
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

test("is number?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  // @tstyche fixme
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

// @tstyche fixme
describe("is fixme?", () => {
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  test("is number?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is fixme?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<string>().type.toBe<string>();
  });

  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });
});

// @tstyche fixme -- Consider removing the directive
describe("is describe?", () => {
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is fixme?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<string>().type.toBe<string>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is number?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();
  });
});

describe("is describe?", () => {
  test("is number?", () => {
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();

    // @tstyche fixme
    expect<never>().type.toBe<number>();
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is number?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is fixme?", () => {
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();

    // @tstyche fixme
    expect<never>().type.toBe<number>();

    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });
});
