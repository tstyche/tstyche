import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

const a: number = "nine";

if (a > 9) {
  //
}

test(284963, () => {
  expect<string>().type.toBeString();
});
