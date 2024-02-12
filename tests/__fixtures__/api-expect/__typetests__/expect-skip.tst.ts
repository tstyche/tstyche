import { describe, expect, test } from "tstyche";

expect<string>().type.toBeString();
expect.skip<never>().type.toBeString();

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
    expect.skip<never>().type.toBeVoid();
  });
});

describe.skip("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBeVoid();
  });
});

test("is number?", () => {
  expect<number>().type.toBeNumber();
  expect.skip<never>().type.toBeVoid();
});

test("is assignable?", () => {
  let a: string | undefined = "abc";
  a = undefined;

  expect.skip(a).type.toBeVoid();
});

test.skip("is skipped?", () => {
  expect<never>().type.toBeString();
});

test.todo("is todo?");
