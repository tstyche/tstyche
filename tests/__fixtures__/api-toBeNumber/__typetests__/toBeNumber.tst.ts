import { expect, test } from "tstyche";

declare function returnsNumber(): number;
declare function returnsVoid(): void;

test("is number?", () => {
  expect(returnsNumber()).type.toBeNumber();

  expect(returnsVoid()).type.toBeNumber();
});

test("is NOT number?", () => {
  expect(returnsVoid()).type.not.toBeNumber();

  expect(returnsNumber()).type.not.toBeNumber();
});
