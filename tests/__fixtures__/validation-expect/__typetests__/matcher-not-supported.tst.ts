import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
  expect<number>().type.not.toBe<string>();
});

test("is not supported?", () => {
  // @ts-expect-error!
  expect<string>().type.toBeSupported();
  // @ts-expect-error!
  expect<number>().type.not.toBeSupported();
});
