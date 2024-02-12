import { expect, test } from "tstyche";

declare function returnsSymbol(): symbol;
declare function returnsVoid(): void;

test("is symbol?", () => {
  expect(returnsSymbol()).type.toBeSymbol();

  expect(returnsVoid()).type.toBeSymbol();
});

test("is NOT symbol?", () => {
  expect(returnsVoid()).type.not.toBeSymbol();

  expect(returnsSymbol()).type.not.toBeSymbol();
});
