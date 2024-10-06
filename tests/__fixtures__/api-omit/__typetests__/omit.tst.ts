import { expect, omit, test } from "tstyche";

declare function returnsObject(): { one: number; two?: string };
declare function returnsIntersection(): { one: number; two?: string } | { one: number };
declare function returnsUnion(): { one: number } & { two?: string };

test("is omitted?", () => {
  expect(omit(returnsObject(), "one")).type.toBe<{ two?: string }>();
  expect(omit(returnsObject(), "one")).type.toBe<{ one: number; two?: string }>();

  expect(omit(returnsIntersection(), "two")).type.toBe<{ one: number }>();
  expect(omit(returnsIntersection(), "two")).type.toBe<{ one: number; two?: string }>();

  expect(omit(returnsUnion(), "one")).type.toBe<{ two?: string }>();
  expect(omit(returnsUnion(), "one")).type.toBe<{ one: number; two?: string }>();
});
