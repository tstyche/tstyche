import { expect, it } from "tstyche";

it.only("is only?", () => {
  expect("abc" as string).type.toBeString();
});

it("is skipped?", () => {
  const a: string = 123;

  expect("abc" as string).type.toBeString();
});

it.only("is only too?", () => {
  expect("abc" as string).type.toBeString();
});

it.todo("is todo?");

it("is skipped too?", () => {
  expect("abc" as string).type.toBeString();
});
