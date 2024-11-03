import { expect, omit, test } from "tstyche";

declare function returnsObject(): { one: number; two?: string; three?: boolean };
declare function returnsIntersection():
  | { one: number; two?: string; three?: boolean }
  | { one: number; three?: boolean };
declare function returnsUnion(): { one: number } & { two?: string; three?: boolean };

test("is single key omitted?", () => {
  expect(omit(returnsObject(), "one")).type.toBe<{ two?: string; three?: boolean }>();
  expect(returnsObject()).type.toBe<{ two?: string; three?: boolean }>(); // fail

  expect(omit(returnsIntersection(), "two")).type.toBe<{ one: number; three?: boolean }>();
  expect(returnsIntersection()).type.toBe<{ one: number; three?: boolean }>(); // fail

  expect(omit(returnsUnion(), "one")).type.toBe<{ two?: string; three?: boolean }>();
  expect(returnsUnion()).type.toBe<{ two?: string; three?: boolean }>(); // fail
});

test("are several keys omitted?", () => {
  expect(omit(returnsObject(), "one", "three")).type.toBe<{ two?: string }>();
  expect(returnsObject()).type.toBe<{ two?: string }>(); // fail

  expect(omit(returnsIntersection(), "two", "three")).type.toBe<{ one: number }>();
  expect(returnsIntersection()).type.toBe<{ one: number }>(); // fail

  expect(omit(returnsUnion(), "one", "three")).type.toBe<{ two?: string }>();
  expect(returnsUnion()).type.toBe<{ two?: string }>(); // fail
});
