import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeNever' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeNever", jest.expect.any(Function));
});

declare function returnsNever(): never;
declare function returnsString(): string;

test("is never?", () => {
  expect(returnsNever()).type.toBeNever();

  expect(returnsString()).type.toBeNever();
});

test("is NOT never?", () => {
  expect(returnsString()).type.not.toBeNever();

  expect(returnsNever()).type.not.toBeNever();
});
