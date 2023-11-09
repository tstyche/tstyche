import * as jest from "@jest/globals";
import { context, expect, test } from "tstyche";

jest.test("'context.skip' implementation'", () => {
  jest.expect(context.skip).toBeInstanceOf(Function);
});

context.skip("is skipped context?", () => {
  test("is skipped?", () => {
    expect<string>().type.toBeString();
  });
});

context("is parent context?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });

  context.skip("is nested skipped context?", function () {
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
