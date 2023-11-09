import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'expect.fail' implementation'", () => {
  jest.expect(expect.fail).toBeInstanceOf(Function);
});

expect<string>().type.toBeString();
expect.fail<string>().type.toBeString();

expect.fail<never>().type.toBeString();

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
    expect.fail<string>().type.toBeString();

    expect.fail<never>().type.toBeVoid();
  });
});

test("is number?", () => {
  expect<number>().type.toBeNumber();
  expect.fail<number>().type.toBeNumber();

  expect.fail<never>().type.toBeVoid();
});
