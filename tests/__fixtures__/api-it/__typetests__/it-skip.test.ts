import * as jest from "@jest/globals";
import { expect, it } from "tstyche";

jest.test("'it.skip' implementation'", () => {
  jest.expect(it.skip).toBeInstanceOf(Function);
});

it.skip("is skipped?", () => {
  expect("abc" as string).type.toBeString();
});

it("is string?", () => {
  expect("abc" as string).type.toBeString();
});

it.skip("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
