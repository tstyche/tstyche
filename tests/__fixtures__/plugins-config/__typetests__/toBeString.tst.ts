import { expect, test } from "tstyche";

declare function returnsString(): string;
declare function returnsVoid(): void;

test("is string?", () => {
  expect(returnsString()).type.toBeString();
});
