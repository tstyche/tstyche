import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeUndefined' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeUndefined", jest.expect.any(Function));
});

declare function returnsUndefined(): undefined;
declare function returnsString(): string;

test("is undefined?", () => {
  expect(returnsUndefined()).type.toBeUndefined();

  expect(returnsString()).type.toBeUndefined();
});

test("is NOT undefined?", () => {
  expect(returnsString()).type.not.toBeUndefined();

  expect(returnsUndefined()).type.not.toBeUndefined();
});
