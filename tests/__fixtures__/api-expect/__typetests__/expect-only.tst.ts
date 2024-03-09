import { describe, expect, test } from "tstyche";

expect.only<string>().type.toBeString();
expect<never>().type.toBeString();

expect.only(() => {
  expect<never>().type.toBeNumber();
}).type.toBe<() => void>();

describe("is describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBeVoid();
    expect.only<string>().type.toBeString();
  });
});

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBeVoid();
  });
});

test.only("is number?", () => {
  expect<number>().type.toBeNumber();
  expect.skip<never>().type.toBeVoid();
});

test("is skipped?", () => {
  expect<never>().type.toBeString();
});

test.todo("is todo?");
