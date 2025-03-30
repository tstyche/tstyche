import { expect, test } from "tstyche";

test.only("is only?", () => {
  expect("abc" as string).type.toBe<string>();
});

test("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBe<string>();
});

test.only("is only too?", () => {
  expect("abc" as string).type.toBe<string>();
});

test.todo("is todo?");

test("is skipped too?", () => {
  expect("abc" as string).type.toBe<string>();
});
