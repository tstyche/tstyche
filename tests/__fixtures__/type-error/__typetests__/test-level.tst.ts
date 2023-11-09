import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

test.skip("skipped type error?", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Testing purpose
  expect<string>().toBeString();
});

test("reported type error?", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Testing purpose
  expect<string>().toBeString();
});
