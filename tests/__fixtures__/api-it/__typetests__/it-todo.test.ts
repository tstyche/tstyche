import * as jest from "@jest/globals";
import { expect, it } from "tstyche";

jest.test("'it.todo' implementation", () => {
  jest.expect(it.todo).toBeInstanceOf(Function);
});

it.todo("is todo?");

it("is string?", () => {
  expect("abc" as string).type.toBeString();
});

it.todo("is todo too?");

it.todo("and this one is todo?", () => {
  const a: string = 123;

  expect(a).type.toBeString();
});
