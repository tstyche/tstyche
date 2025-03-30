import { expect, test } from "tstyche";

declare function returnsBoolean(): boolean;

test("is boolean?", () => {
  expect(returnsBoolean()).type.toBe<boolean>();
});
