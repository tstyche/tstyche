import { expect, test } from "tstyche";

declare function returnsUnknown(): unknown;
declare function returnsString(): string;

test("is unknown?", () => {
  expect(returnsUnknown()).type.toBeUnknown();

  expect(returnsString()).type.toBeUnknown();
});

test("is NOT unknown?", () => {
  expect(returnsString()).type.not.toBeUnknown();

  expect(returnsUnknown()).type.not.toBeUnknown();
});
