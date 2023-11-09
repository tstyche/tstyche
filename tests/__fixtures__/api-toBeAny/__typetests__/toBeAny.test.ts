import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeAny' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeAny", jest.expect.any(Function));
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function returnsAny(): any;
declare function returnsString(): string;

test("is any?", () => {
  expect(returnsAny()).type.toBeAny();

  expect(returnsString()).type.toBeAny();
});

test("is NOT any?", () => {
  expect(returnsString()).type.not.toBeAny();

  expect(returnsAny()).type.not.toBeAny();
});
