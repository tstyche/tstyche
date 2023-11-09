import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeString' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeString", jest.expect.any(Function));
});

declare function returnsString(): string;
declare function returnsVoid(): void;

test("is string?", () => {
  expect(returnsString()).type.toBeString();

  expect(returnsVoid()).type.toBeString();
});

test("is NOT string?", () => {
  expect(returnsVoid()).type.not.toBeString();

  expect(returnsString()).type.not.toBeString();
});
