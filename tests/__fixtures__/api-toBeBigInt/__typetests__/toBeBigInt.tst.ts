import { expect, test } from "tstyche";

declare function returnsBigInt(): bigint;
declare function returnsVoid(): void;

test("is bigint?", () => {
  expect(returnsBigInt()).type.toBeBigInt();

  expect(returnsVoid()).type.toBeBigInt();
});

test("is NOT bigint?", () => {
  expect(returnsVoid()).type.not.toBeBigInt();

  expect(returnsBigInt()).type.not.toBeBigInt();
});
