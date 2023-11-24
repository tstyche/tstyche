import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'expect.only' implementation'", () => {
  jest.expect(expect.only).toBeInstanceOf(Function);
});

expect.only<string>().type.toBeString();
expect<never>().type.toBeString();

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
