import { expect, test } from "tstyche";

declare function returnsNull(): null;
declare function returnsVoid(): void;

test("is null?", () => {
  expect(returnsNull()).type.toBeNull();

  expect(returnsVoid()).type.toBeNull();
});

test("is NOT null?", () => {
  expect(returnsVoid()).type.not.toBeNull();

  expect(returnsNull()).type.not.toBeNull();
});
