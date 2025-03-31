import { expect, test } from "tstyche";

declare function returnsNumber(): number;

test("is number?", () => {
  expect(returnsNumber()).type.toBe<number>();
});
