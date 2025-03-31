import { describe, expect, test } from "tstyche";

expect<string>().type.toBe<string>();
expect.only.fail<string>().type.toBe<string>();

expect.only.fail<never>().type.toBe<string>();

expect.only
  .fail(() => {
    expect<never>().type.toBe<number>();
  })
  .type.toBe<void>();

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
    expect.only.fail<string>().type.toBe<string>();

    expect.only.fail<never>().type.toBe<void>();
  });
});

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
  });
});

test.only("is number?", () => {
  expect.skip<string>().type.toBe<number>();
  expect.fail<number>().type.toBe<number>();

  expect.fail<never>().type.toBe<void>();
});

test("is skipped?", () => {
  expect<never>().type.toBe<string>();
});

test.todo("is todo?");
