import { context, expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

context("handles nested 'expect()'?", () => {
  expect<never>().type.toBeNever();
  expect<null>().type.toBeNull();

  test("is number?", () => {
    expect<number>().type.toBeNumber();
  });
});
