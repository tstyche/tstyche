import { describe, expect, test } from "tstyche";

enum Direction {
  Up = 1,
  Down,
}

interface Names {
  first: string;
  last?: string;
}
declare function getNames(): Names;

interface Size {
  height: number;
  width: number;
}
declare function getSize(): Size;

test("difference from '.toBeAssignableTo()'", () => {
  expect<any>().type.toBeAssignableTo<string>();
  // But all types are not subtypes of the 'any' type
  expect<any>().type.not.toMatch<string>();

  expect<number>().type.toBeAssignableTo<Direction>();
  // But an enum type is not a subtype of a number
  expect<number>().type.not.toMatch<Direction>();

  expect<{ a: string }>().type.toBeAssignableTo<{ a: string; b?: number }>();
  // But an object type with an optional property is not a subtype
  // of the same object type without that particular property
  expect<{ a: string }>().type.not.toMatch<{ a: string; b?: number }>();

  expect<{ readonly a: string }>().type.toBeAssignableTo<{ a: string }>();
  // But an object type with a particular property is not a subtype
  // of the same object type with that property marked 'readonly'
  expect<{ readonly a: string }>().type.not.toMatch<{ a: string }>();
});

describe("received type", () => {
  test("matches expected type", () => {
    expect<{ a: string; b: number }>().type.toMatch<{ a: string }>();
    expect<{ a: string; b: number }>().type.toMatch<{ b: number }>();

    expect<{ a: string; b?: number }>().type.toMatch<{ a: string }>();
    expect<{ a: string; b?: number }>().type.toMatch<{ a?: string }>();
    expect<{ a: string; b?: number }>().type.toMatch<{ b?: number }>();

    expect<{ a: string; b?: number }>().type.toMatch<{ b: number }>();
  });

  test("does NOT match expected type", () => {
    expect<{ a: string }>().type.not.toMatch<{ b: number }>();

    expect<{ a: string; b?: number }>().type.not.toMatch<{ b: number }>();
    expect<{ a: string }>().type.not.toMatch<{ a: string; b?: number }>();

    expect<{ a: string }>().type.toMatch<{ a: string; b?: number }>();
  });

  test("matches expected value", () => {
    expect<{ first: string; last: string }>().type.toMatch(getNames());
    expect<{ first: string; last?: string }>().type.toMatch(getNames());

    expect<{ first: string }>().type.toMatch(getNames());
  });

  test("does NOT match expected value", () => {
    expect<{ first?: string }>().type.not.toMatch(getNames());

    expect<{ first?: string }>().type.toMatch(getNames());
  });
});

describe("received value", () => {
  test("matches expected type", () => {
    expect(getSize()).type.toMatch<{ height: number }>();
    expect(getSize()).type.toMatch<{ width: number }>();

    expect(getNames()).type.toMatch<{ first: string }>();
    expect(getNames()).type.toMatch<{ first?: string }>();
    expect(getNames()).type.toMatch<{ last?: string }>();

    expect(getNames()).type.toMatch<{ last: string }>();
  });

  test("does NOT match expected type", () => {
    expect(getSize()).type.not.toMatch<{ depth: number }>();

    expect(getNames()).type.not.toMatch<{ last: string }>();
    expect(getNames()).type.toMatch<{ last: string }>();
  });

  test("matches expected value", () => {
    expect({ height: 123, width: 123 }).type.toMatch(getSize());

    expect({ first: "One" }).type.toMatch(getNames());
    expect({ first: "One", last: "Two" }).type.toMatch(getNames());

    expect({ last: "Two" }).type.toMatch(getNames());
  });

  test("does NOT match expected value", () => {
    expect({ last: "Two" }).type.not.toMatch(getNames());

    expect({ first: "One" }).type.not.toMatch(getNames());
  });
});
