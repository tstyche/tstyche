import { expect, test } from "tstyche";

test("must be followed by the '.type' modifier", () => {
  expect();

  expect<string>().type.toBe<string>();
});

test("the final element must be a matcher", () => {
  expect().type;
  expect().type.not;

  expect<string>().type.toBe<string>();
});

test("must be completed with '()'", () => {
  expect().type.toBe;
  expect().type.toBe<string>;
  expect().type.not.toBe;
  expect().type.not.toBe<string>;

  expect<string>().type.toBe<string>();
});
