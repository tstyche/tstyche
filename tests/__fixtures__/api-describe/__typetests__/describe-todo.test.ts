import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'describe.todo' implementation'", () => {
  jest.expect(describe.todo).toBeInstanceOf(Function);
});

describe.todo("is todo describe?");

describe.todo("is todo describe too?", () => {
  const a: string = 123;

  test("is todo?", () => {
    const b: number = "abc";

    expect(a).type.toBeString();
  });
});

describe.skip("is parent skipped describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });

  describe.todo("is nested todo describe?", function() {
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
