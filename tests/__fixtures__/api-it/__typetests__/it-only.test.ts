import * as jest from "@jest/globals";
import { expect, it } from "tstyche";

jest.test("'it.only' implementation", () => {
  jest.expect(it.only).toBeInstanceOf(Function);
});

it.only("is only?", () => {
  expect("abc" as string).type.toBeString();
});

it("is skipped?", () => {
  expect("abc" as string).type.toBeString();
});

it.only("is only too?", () => {
  expect("abc" as string).type.toBeString();
});

it.todo("is todo?");

it("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
