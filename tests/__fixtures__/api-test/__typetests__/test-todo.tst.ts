import { expect, test } from "tstyche";

test.todo("is todo?");

test("is string?", () => {
  expect("abc" as string).type.toBe<string>();
});

test.todo("is todo too?");

test.todo("and this one is todo?", () => {
  const a: string = 123;

  expect(a).type.toBe<string>();
});
