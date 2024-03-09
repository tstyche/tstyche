import { expect, it } from "tstyche";

it.skip("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBeString();
});

it("is string?", () => {
  expect("abc" as string).type.toBeString();
});

it.skip("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
