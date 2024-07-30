import { describe, expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

describe("nested 'expect()' is handled?", () => {
  expect<never>().type.toBeNever();
  expect<null>().type.toBeNull();

  test("is number?", () => {
    expect<number>().type.toBeNumber();
  });
});
