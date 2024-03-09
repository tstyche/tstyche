import { expect, test } from "tstyche";

declare function returnsNever(): never;
declare function returnsString(): string;

test("is never?", () => {
  expect(returnsNever()).type.toBeNever();

  expect(returnsString()).type.toBeNever();
});

test("is NOT never?", () => {
  expect(returnsString()).type.not.toBeNever();

  expect(returnsNever()).type.not.toBeNever();
});
