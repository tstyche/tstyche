import { describe, expect, test } from "tstyche";

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

test("edge cases", () => {
  expect<any>().type.not.toBe<never>();
  expect<any>().type.not.toBe<unknown>(); // fail

  expect<{ a: string } | { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } | { a: string }>().type.not.toBe<{ a: string }>(); // fail

  expect<{ a: string } | { b: string }>().type.not.toBe<{ a: string }>();
  expect<{ a: string } | { b: string }>().type.toBe<{ a: string }>(); // fail

  expect<{ a: string } & { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } & { a: string }>().type.not.toBe<{ a: string }>(); // fail

  expect<{ a: string } & { b: string }>().type.not.toBe<{ a: string }>();
  expect<{ a: string } & { b: string }>().type.toBe<{ a: string }>(); // fail

  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.not.toBe<{ a: string }>(); // fail

  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.not.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.toBe<{ a: string }>(); // fail

  expect<{ a: string }>().type.toBe<{ a: string } | { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } | { a: string }>(); // fail

  expect<{ a: string }>().type.not.toBe<{ a: string } | { b: string }>();
  expect<{ a: string }>().type.toBe<{ a: string } | { b: string }>(); // fail

  expect<{ a: string }>().type.toBe<{ a: string } & { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } & { a: string }>(); // fail

  expect<{ a: string }>().type.not.toBe<{ a: string } & { b: string }>();
  expect<{ a: string }>().type.toBe<{ a: string } & { b: string }>(); // fail

  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>();
  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>(); // fail

  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>();
  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>(); // fail

  expect(Date).type.toBe<typeof Date>();
});

test("exact optional property types", () => {
  // all four assertions pass only when '"exactOptionalPropertyTypes": true' is set

  expect<{ a?: number }>().type.not.toBe<{ a?: number | undefined }>();
  expect<{ a?: number | undefined }>().type.not.toBe<{ a?: number }>();

  expect<{ a?: number }>().type.not.toBeAssignableFrom<{ a?: number | undefined }>();
  expect<{ a?: number | undefined }>().type.not.toBeAssignableTo<{ a?: number }>();
});

describe("when source is a type", () => {
  test("is the same as the target type", () => {
    expect<{ a: string; b: number }>().type.toBe<{ a: string; b: number }>();
    expect<Names>().type.toBe<{ first: string; last?: string }>();

    expect<Names>().type.toBe<{ first: string; last: string }>(); // fail
  });

  test("is NOT the same as the target type", () => {
    expect<Names>().type.not.toBe<{ first: string; last: string }>();

    expect<Names>().type.not.toBe<{ first: string; last?: string }>(); // fail
  });

  test("is the same as type of the target expression", () => {
    expect<Names>().type.toBe(getNames());
    expect<{ first: string; last?: string }>().type.toBe(getNames());

    expect<{ first: string; last: string }>().type.toBe(getNames()); // fail
  });

  test("is NOT the same as type of the target expression", () => {
    expect<{ first: string; last: string }>().type.not.toBe(getNames());

    expect<{ first: string; last?: string }>().type.not.toBe(getNames()); // fail
  });
});

describe("when source is an expression", () => {
  test("is the same as the target type", () => {
    expect(getNames()).type.toBe<{ first: string; last?: string }>();
    expect(getNames()).type.toBe<Names>();

    expect(getNames()).type.toBe<{ first: string; last: string }>(); // fail
  });

  test("is NOT the same as the target type", () => {
    expect(getNames()).type.not.toBe<{ first: string; last: string }>();

    expect(getNames()).type.not.toBe<{ first: string; last?: string }>(); // fail
  });

  test("is the same as type of the target expression", () => {
    expect({ height: 14, width: 25 }).type.toBe(getSize());

    expect({ height: 14 }).type.toBe(getSize()); // fail
  });

  test("is NOT the same as type of the target expression", () => {
    expect({ height: 14 }).type.not.toBe(getSize());

    expect({ height: 14, width: 25 }).type.not.toBe(getSize()); // fail
  });
});
