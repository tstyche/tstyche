import { expect, test } from "tstyche";

declare function returnsString(): string;

test("is string?", () => {
  expect(returnsString()).type.toBeString();
});
