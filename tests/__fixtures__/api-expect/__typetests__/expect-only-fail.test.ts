import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'expect.only.fail' implementation'", () => {
  jest.expect(expect.only.fail).toBeInstanceOf(Function);
});

expect<string>().type.toBeString();
expect.only.fail<string>().type.toBeString();

expect.only.fail<never>().type.toBeString();

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
    expect.only.fail<string>().type.toBeString();

    expect.only.fail<never>().type.toBeVoid();
  });
});

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBeVoid();
  });
});

test("is number?", () => {
  expect<number>().type.toBeNumber();
  expect.only.fail<number>().type.toBeNumber();

  expect.only.fail<never>().type.toBeVoid();
});

test("is skipped?", () => {
  expect<never>().type.toBeString();
});

test.todo("is todo?");
