import { expect, pick, test } from "tstyche";

declare function returnsObject(): {
  one: number;
  two?: string;
  three?: boolean;
};
declare function returnsIntersection():
  | { one: number; two?: string; three?: boolean }
  | { one: number; three?: boolean };
declare function returnsUnion(): { one: number } & {
  two?: string;
  three?: boolean;
};

test("is single key picked?", () => {
  expect(pick(returnsObject(), "two")).type.toBe<{ two?: string }>();
  expect(returnsObject()).type.toBe<{ two?: string }>(); // fail

  expect(pick(returnsIntersection(), "one")).type.toBe<{ one: number }>();
  expect(returnsIntersection()).type.toBe<{ one: number }>(); // fail

  expect(pick(returnsUnion(), "two")).type.toBe<{ two?: string }>();
  expect(returnsUnion()).type.toBe<{ two?: string }>(); // fail
});

test("are several keys picked?", () => {
  expect(pick(returnsObject(), "one", "three")).type.toBe<{
    one: number;
    three?: boolean;
  }>();
  expect(returnsObject()).type.toBe<{ one: number; three?: boolean }>(); // fail

  expect(pick(returnsIntersection(), "one", "three")).type.toBe<{
    one: number;
    three?: boolean;
  }>();
  expect(returnsIntersection()).type.toBe<{ one: number; three?: boolean }>(); // fail

  expect(pick(returnsUnion(), "two", "three")).type.toBe<{
    two?: string;
    three?: boolean;
  }>();
  expect(returnsUnion()).type.toBe<{ two?: string; three?: boolean }>(); // fail
});
