import { expect, test } from "tstyche";

declare function returnsVoid(): void;
declare function returnsString(): string;

test("is void?", () => {
  expect(returnsVoid()).type.toBeVoid();

  expect(returnsString()).type.toBeVoid();
});

test("is NOT void?", () => {
  expect(returnsString()).type.not.toBeVoid();

  expect(returnsVoid()).type.not.toBeVoid();
});
