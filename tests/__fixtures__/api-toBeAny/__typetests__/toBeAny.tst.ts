import { expect, test } from "tstyche";

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
