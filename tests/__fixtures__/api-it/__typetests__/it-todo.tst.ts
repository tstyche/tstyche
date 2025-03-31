import { expect, it } from "tstyche";

it.todo("is todo?");

it("is string?", () => {
  expect("abc" as string).type.toBe<string>();
});

it.todo("is todo too?");

it.todo("and this one is todo?", () => {
  const a: string = 123;

  expect(a).type.toBe<string>();
});
