import { describe, expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

describe("nested 'expect()' is handled?", () => {
  expect<never>().type.toBe<never>();
  expect<null>().type.toBe<null>();

  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });
});
