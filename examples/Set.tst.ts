import { expect, test } from "tstyche";

test("is assignable to?", () => {
  expect(new Set(["abc"])).type.toBeAssignableTo<Set<string>>();
  expect(new Set([123])).type.toBeAssignableTo<Set<number>>();

  expect(new Set([123, "abc"])).type.not.toBeAssignableTo<Set<string>>();
  expect(new Set([123, "abc"])).type.not.toBeAssignableTo<Set<number>>();
});
