import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'toBeVoid' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeVoid", jest.expect.any(Function));
});

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
