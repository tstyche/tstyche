import { expect, it } from "tstyche";

it.skip("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBe<string>();
});

it("is string?", () => {
  expect("abc" as string).type.toBe<string>();
});

it.skip("is skipped too?", () => {
  expect("abc" as string).type.toBe<string>();
});
