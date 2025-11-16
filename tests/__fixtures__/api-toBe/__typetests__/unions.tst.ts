import { expect, test } from "tstyche";

// TODO
// objects, array of objects
// tuples, array of tuples
// type references, like 'Promise<string>'

test("edge cases", () => {
  expect<string | any>().type.toBe<any>();
  expect<string | unknown>().type.toBe<unknown>();
  expect<string | never>().type.toBe<string>();
});

test("is union the same?", () => {
  expect<string | number>().type.toBe<string | number>();
  expect<string | Array<string>>().type.toBe<string | Array<string>>();

  expect<string | number>().type.toBe<string | boolean>(); // fail
  expect<string | Array<string>>().type.toBe<string | Array<number>>(); // fail
});

test("is union NOT the same?", () => {
  expect<string | number>().type.not.toBe<string | boolean>();
  expect<string | Array<string>>().type.not.toBe<string | Array<number>>();

  expect<string | number>().type.not.toBe<string | number>(); // fail
  expect<string | Array<string>>().type.not.toBe<string | Array<string>>(); // fail
});
