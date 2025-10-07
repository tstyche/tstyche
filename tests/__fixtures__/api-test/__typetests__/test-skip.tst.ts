import { expect, test } from "tstyche";

test.skip("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBe<string>();
});

test("is string?", () => {
  expect("abc" as string).type.toBe<string>();
});

test.skip("is skipped too?", () => {
  expect("abc" as string).type.toBe<string>();
});
