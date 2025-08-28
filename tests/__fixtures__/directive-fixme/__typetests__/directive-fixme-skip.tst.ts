import { describe, expect, test } from "tstyche";

// @tstyche fixme -- Known bug, see: #345
expect.skip<never>().type.toBe<string>();

expect<string>().type.toBe<string>();
// @tstyche fixme -- Consider removing the directive
expect.skip<string>().type.toBe<string>();

// @tstyche fixme -- This should work, see: #265
expect
  .skip(() => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- This should work, see: #265
    expect<never>().type.toBe<string>();
    // @tstyche fixme -- Consider removing the directive
    expect<string>().type.toBe<string>();
  })
  .type.toBe<void>();

// @tstyche fixme
test.skip("is fixme?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  expect<never>().type.toBe<number>(); // silenced fail
  expect<string>().type.toBe<string>();
});

// @tstyche fixme -- Consider removing the directive
test.skip("is number?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  // @tstyche fixme
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

test("is number?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect.skip<number>().type.toBe<number>();

  // @tstyche fixme
  expect.skip<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

// @tstyche fixme
describe.skip("is fixme?", () => {
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
describe.skip("is describe?", () => {
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
    expect.skip<number>().type.toBe<number>();

    // @tstyche fixme
    expect.skip<never>().type.toBe<number>();
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Consider removing the directive
  test.skip("is number?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test.skip("is fixme?", () => {
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();

    // @tstyche fixme
    expect<never>().type.toBe<number>();

    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });
});
