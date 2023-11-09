import * as jest from "@jest/globals";
import { expect, test } from "tstyche";

jest.test("'test.skip' implementation'", () => {
  jest.expect(test.skip).toBeInstanceOf(Function);
});

test.skip("is skipped?", () => {
  expect("abc" as string).type.toBeString();
});

test("is string?", () => {
  expect("abc" as string).type.toBeString();
});

test.skip("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
