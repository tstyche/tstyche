import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'test.todo' implementation'", () => {
  jest.expect(test.todo).toBeInstanceOf(Function);
});

test.todo("is todo?");

test("is string?", () => {
  expect("abc" as string).type.toBeString();
});

test.todo("is todo too?");

test.todo("and this one is todo?", () => {
  const a: string = 123;

  expect(a).type.toBeString();
});
