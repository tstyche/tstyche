import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeBoolean' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeBoolean", jest.expect.any(Function));
});

declare function returnsBoolean(): boolean;
declare function returnsString(): string;

test("is boolean?", () => {
  expect(returnsBoolean()).type.toBeBoolean();

  expect(returnsString()).type.toBeBoolean();
});

test("is NOT boolean?", () => {
  expect(returnsString()).type.not.toBeBoolean();

  expect(returnsBoolean()).type.not.toBeBoolean();
});
