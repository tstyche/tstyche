import { expect, test } from "tstyche";

test.only("is only?", () => {
  expect("abc" as string).type.toBeString();
});

test("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBeString();
});

test.only("is only too?", () => {
  expect("abc" as string).type.toBeString();
});

test.todo("is todo?");

test("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
