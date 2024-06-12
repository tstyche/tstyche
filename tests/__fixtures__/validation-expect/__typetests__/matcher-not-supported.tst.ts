import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
  expect<number>().type.not.toBeString();
});

test("is not supported?", () => {
  // @ts-expect-error
  expect<string>().type.toBeSupported();
  // @ts-expect-error
  expect<number>().type.not.toBeSupported();
});
