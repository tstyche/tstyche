import { describe, expect, test } from "tstyche";

expect<string>().type.toBe<string>();
expect.fail<string>().type.toBe<string>();

expect.fail<never>().type.toBe<string>();

expect
  .fail(() => {
    expect<number>().type.toBe<number>();
  })
  .type.toBe<void>();

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
    expect.fail<string>().type.toBe<string>();

    expect.fail<never>().type.toBe<void>();
  });
});

test("is number?", () => {
  expect<number>().type.toBe<number>();
  expect.fail<number>().type.toBe<number>();

  expect.fail<never>().type.toBe<void>();
});
