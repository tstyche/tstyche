import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'describe.skip' implementation'", () => {
  jest.expect(describe.skip).toBeInstanceOf(Function);
});

describe.skip("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<string>().type.toBeString();
  });
});

describe("is parent describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });

  describe.skip("is nested skipped describe?", function () {
    test.skip("is skipped too?", () => {
      expect<string>().type.toBeString();
    });

    test.todo("is todo?");
  });

  test.todo("is todo?");
});

test("is string still?", () => {
  expect<string>().type.toBeString();
});
