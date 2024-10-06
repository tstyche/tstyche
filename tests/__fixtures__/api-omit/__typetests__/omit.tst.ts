import { expect, omit, test } from "tstyche";

declare function returnsObject(): { one: number; two?: string };
declare function returnsIntersection(): { one: number; two?: string } | { one: number };
declare function returnsUnion(): { one: number } & { two?: string };

test("is omitted?", () => {
  expect(omit(returnsObject(), "one")).type.toBe<{ two?: string }>();
  expect(returnsObject()).type.toBe<{ two?: string }>(); // fail

  expect(omit(returnsIntersection(), "two")).type.toBe<{ one: number }>();
  expect(returnsIntersection()).type.toBe<{ one: number }>(); // fail

  expect(omit(returnsUnion(), "one")).type.toBe<{ two?: string }>();
  expect(returnsUnion()).type.toBe<{ two?: string }>(); // fail
});
