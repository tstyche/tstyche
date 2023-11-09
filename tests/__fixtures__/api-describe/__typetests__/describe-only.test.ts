import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'describe.only' implementation'", () => {
  jest.expect(describe.only).toBeInstanceOf(Function);
});

describe("is describe?", () => {
  test("is skipped?", () => {
    expect<void>().type.toBeVoid();
  });
});

describe.only("is only describe?", () => {
  test("is never?", () => {
    expect<never>().type.toBeNever();
  });

  test.skip("is skipped?", () => {
    expect<never>().type.toBeNever();
  });

  test.todo("is todo?");

  test.only("is string?", () => {
    expect<string>().type.toBeString();
  });

  describe("is nested describe?", function () {
    test("is string?", () => {
      expect<string>().type.toBeString();
    });

    test.skip("is skipped?", () => {
      expect<never>().type.toBeNever();
    });
  });

  describe.only("is nested only describe?", function () {
    test("is string?", () => {
      expect<string>().type.toBeString();
    });

    test.todo("is todo?");
  });

  describe.skip("is nested skipped describe?", function () {
    test("is skipped?", () => {
      expect<string>().type.toBeString();
    });

    test.only("is skipped?", () => {
      expect<never>().type.toBeNever();
    });
  });
});

test("is skipped?", () => {
  expect<string>().type.toBeString();
});
