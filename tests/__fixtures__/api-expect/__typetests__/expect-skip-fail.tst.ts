import { describe, expect, test } from "tstyche";

expect.skip.fail<string>().type.toBe<string>();
expect.fail<string>().type.toBe<string>();

expect.skip
  .fail(() => {
    expect<number>().type.toBe<number>();
  })
  .type.toBe<void>();

describe("is describe?", () => {
  test("is string?", () => {
    expect.skip.fail<string>().type.toBe<string>();
    expect.fail<string>().type.toBe<string>();
  });
});

test("is number?", () => {
  expect.skip.fail<number>().type.toBe<number>();
  expect.fail<number>().type.toBe<number>();
});
