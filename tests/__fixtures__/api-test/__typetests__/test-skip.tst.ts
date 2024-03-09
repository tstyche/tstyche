import { expect, test } from "tstyche";

test.skip("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBeString();
});

test("is string?", () => {
  expect("abc" as string).type.toBeString();
});

test.skip("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
