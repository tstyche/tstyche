import { expect, test } from "tstyche";

test("Readonly", () => {
  expect<Readonly<Array<string>>>().type.not.toMatch<Array<string>>();
  expect<Readonly<Map<string, string>>>().type.not.toMatch<Map<string, string>>();
  expect<Readonly<Set<string>>>().type.not.toMatch<Set<string>>();

  expect<Readonly<{ a: string }>>().type.not.toMatch<{ a: string }>();
});
