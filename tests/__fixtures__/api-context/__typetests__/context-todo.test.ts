import * as jest from "@jest/globals";
import { context, expect, test } from "tstyche";

jest.test("'context.todo' implementation'", () => {
  jest.expect(context.todo).toBeInstanceOf(Function);
});

context.todo("is todo context?");

context.todo("is todo context too?", () => {
  const a: string = 123;

  test("is todo?", () => {
    expect(a).type.toBeString();
  });
});

context.skip("is parent skipped context?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });

  context.todo("is nested todo context?", function () {
    test.only("is todo too?", () => {
      expect<string>().type.toBeString();
    });

    test.skip("is todo too?", () => {
      expect<string>().type.toBeString();
    });

    test("and this is todo?", () => {
      expect<string>().type.toBeString();
    });

    test.todo("is todo?");
  });

  test.todo("is todo?");
});

test.only("is string still?", () => {
  expect<string>().type.toBeString();
});
