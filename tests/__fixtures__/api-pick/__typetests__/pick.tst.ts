import { expect, pick, test } from "tstyche";

declare function returnsObject(): { one: number; two?: string };
declare function returnsIntersection(): { one: number; two?: string } | { one: number };
declare function returnsUnion(): { one: number } & { two?: string };

test("is picked?", () => {
  expect(pick(returnsObject(), "two")).type.toBe<{ two?: string }>();
  expect(returnsObject()).type.toBe<{ two?: string }>(); // fail

  expect(pick(returnsIntersection(), "one")).type.toBe<{ one: number }>();
  expect(returnsIntersection()).type.toBe<{ one: number }>(); // fail

  expect(pick(returnsUnion(), "two")).type.toBe<{ two?: string }>();
  expect(returnsUnion()).type.toBe<{ two?: string }>(); // fail
});
