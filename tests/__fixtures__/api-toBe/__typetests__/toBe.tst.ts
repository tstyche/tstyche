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
  expect<any>().type.not.toBe<unknown>();

  expect<{ a: string } | { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } | { a: string }>().type.not.toBe<{ a: string }>();

  expect<{ a: string } | { b: string }>().type.not.toBe<{ a: string }>();
  expect<{ a: string } | { b: string }>().type.toBe<{ a: string }>();

  expect<{ a: string } & { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } & { a: string }>().type.not.toBe<{ a: string }>();

  expect<{ a: string } & { b: string }>().type.not.toBe<{ a: string }>();
  expect<{ a: string } & { b: string }>().type.toBe<{ a: string }>();

  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.not.toBe<{ a: string }>();

  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.not.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.toBe<{ a: string }>();

  expect<{ a: string }>().type.toBe<{ a: string } | { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } | { a: string }>();

  expect<{ a: string }>().type.not.toBe<{ a: string } | { b: string }>();
  expect<{ a: string }>().type.toBe<{ a: string } | { b: string }>();

  expect<{ a: string }>().type.toBe<{ a: string } & { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } & { a: string }>();

  expect<{ a: string }>().type.not.toBe<{ a: string } & { b: string }>();
  expect<{ a: string }>().type.toBe<{ a: string } & { b: string }>();

  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>();
  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>();

  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>();
  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>();

  expect(Date).type.toBe<typeof Date>();
});

test("exact optional property types", () => {
  // all four assertion pass only when '"exactOptionalPropertyTypes": true' is set

  expect<{ a?: number }>().type.not.toBe<{ a?: number | undefined }>();
  expect<{ a?: number | undefined }>().type.not.toBe<{ a?: number }>();

  expect<{ a?: number }>().type.not.toBeAssignableWith<{ a?: number | undefined }>();
  expect<{ a?: number | undefined }>().type.not.toBeAssignableTo<{ a?: number }>();
});

describe("source type", () => {
  test("is identical to target type", () => {
    expect<{ a: string; b: number }>().type.toBe<{ a: string; b: number }>();
    expect<Names>().type.toBe<{ first: string; last?: string }>();

    expect<Names>().type.toBe<{ first: string; last: string }>();
  });

  test("is NOT identical to target type", () => {
    expect<Names>().type.not.toBe<{ first: string; last: string }>();

    expect<Names>().type.not.toBe<{ first: string; last?: string }>();
  });

  test("is identical to target expression", () => {
    expect<Names>().type.toBe(getNames());
    expect<{ first: string; last?: string }>().type.toBe(getNames());

    expect<{ first: string; last: string }>().type.toBe(getNames());
  });

  test("is NOT identical to target expression", () => {
    expect<{ first: string; last: string }>().type.not.toBe(getNames());

    expect<{ first: string; last?: string }>().type.not.toBe(getNames());
  });
});

describe("source expression", () => {
  test("identical to target type", () => {
    expect(getNames()).type.toBe<{ first: string; last?: string }>();
    expect(getNames()).type.toBe<Names>();

    expect(getNames()).type.toBe<{ first: string; last: string }>();
  });

  test("is NOT identical to target type", () => {
    expect(getNames()).type.not.toBe<{ first: string; last: string }>();

    expect(getNames()).type.not.toBe<{ first: string; last?: string }>();
  });

  test("identical to target expression", () => {
    expect({ height: 14, width: 25 }).type.toBe(getSize());

    expect({ height: 14 }).type.toBe(getSize());
  });

  test("is NOT identical to target expression", () => {
    expect({ height: 14 }).type.not.toBe(getSize());

    expect({ height: 14, width: 25 }).type.not.toBe(getSize());
  });
});
