import { expect, test } from "tstyche";

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
