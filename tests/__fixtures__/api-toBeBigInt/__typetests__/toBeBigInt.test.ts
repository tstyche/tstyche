import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeBigInt' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeBigInt", jest.expect.any(Function));
});

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
