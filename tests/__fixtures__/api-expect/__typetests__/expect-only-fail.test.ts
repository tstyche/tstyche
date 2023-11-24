import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'expect.only.fail' implementation'", () => {
  jest.expect(expect.only.fail).toBeInstanceOf(Function);
});

expect<string>().type.toBeString();
expect.only.fail<string>().type.toBeString();

expect.only.fail<never>().type.toBeString();

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBeVoid();
    expect.only.fail<string>().type.toBeString();

    expect.only.fail<never>().type.toBeVoid();
  });
});

describe("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<never>().type.toBeVoid();
  });
});

test.only("is number?", () => {
  expect.skip<string>().type.toBeNumber();
  expect.fail<number>().type.toBeNumber();

  expect.fail<never>().type.toBeVoid();
});

test("is skipped?", () => {
  expect<never>().type.toBeString();
});

test.todo("is todo?");
