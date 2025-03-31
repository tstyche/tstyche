import { describe, expect, test } from "tstyche";

expect.only<string>().type.toBe<string>();
expect<never>().type.toBe<string>();

expect
  .only(() => {
    expect<never>().type.toBe<number>();
  })
  .type.toBe<() => void>();

describe("is describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
    expect.only<string>().type.toBe<string>();
  });
});

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBe<void>();
  });
});

test.only("is number?", () => {
  expect<number>().type.toBe<number>();
  expect.skip<never>().type.toBe<void>();
});

test("is skipped?", () => {
  expect<never>().type.toBe<string>();
});

test.todo("is todo?");
