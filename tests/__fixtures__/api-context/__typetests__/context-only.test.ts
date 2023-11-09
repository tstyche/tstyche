import * as jest from "@jest/globals";
import { context, expect, test } from "tstyche";

jest.test("'context.only' implementation'", () => {
  jest.expect(context.only).toBeInstanceOf(Function);
});

context("is context?", () => {
  test("is skipped?", () => {
    expect<void>().type.toBeVoid();
  });
});

context.only("is only context?", () => {
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

  context("is nested context?", function () {
    test("is string?", () => {
      expect<string>().type.toBeString();
    });
  });

  context.only("is nested only context?", function () {
    test("is string?", () => {
      expect<string>().type.toBeString();
    });

    test.todo("is todo?");
  });

  context.skip("is nested skipped context?", function () {
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
