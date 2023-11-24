import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'test.only' implementation", () => {
  jest.expect(test.only).toBeInstanceOf(Function);
});

test.only("is only?", () => {
  expect("abc" as string).type.toBeString();
});

test("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBeString();
});

test.only("is only too?", () => {
  expect("abc" as string).type.toBeString();
});

test.todo("is todo?");

test("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
