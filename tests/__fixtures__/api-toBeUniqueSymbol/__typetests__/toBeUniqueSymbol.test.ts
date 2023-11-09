import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeUniqueSymbol' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeUniqueSymbol", jest.expect.any(Function));
});

declare const mockedSymbol: unique symbol;

declare function returnsUniqueSymbol(): typeof mockedSymbol;
declare function returnsVoid(): void;

test("is unique symbol?", () => {
  expect(returnsUniqueSymbol()).type.toBeUniqueSymbol();

  expect(returnsVoid()).type.toBeUniqueSymbol();
});

test("is NOT unique symbol?", () => {
  expect(returnsVoid()).type.not.toBeUniqueSymbol();

  expect(returnsUniqueSymbol()).type.not.toBeUniqueSymbol();
});
