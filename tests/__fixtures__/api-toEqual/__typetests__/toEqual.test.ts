import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'toEqual' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toEqual", jest.expect.any(Function));
});

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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  expect<any>().type.not.toEqual<never>();
  expect<any>().type.not.toEqual<unknown>();
  /* eslint-enable @typescript-eslint/no-explicit-any */

  expect(Date).type.toEqual<typeof Date>();
});

describe("received type", () => {
  test("equals expected type", () => {
    expect<{ a: string; b: number }>().type.toEqual<{ a: string; b: number }>();
    expect<Names>().type.toEqual<{ first: string; last?: string }>();

    expect<Names>().type.toEqual<{ first: string; last: string }>();
  });

  test("does NOT equal expected type", () => {
    expect<Names>().type.not.toEqual<{ first: string; last: string }>();

    expect<Names>().type.not.toEqual<{ first: string; last?: string }>();
  });

  test("equals expected value", () => {
    expect<Names>().type.toEqual(getNames());
    expect<{ first: string; last?: string }>().type.toEqual(getNames());

    expect<{ first: string; last: string }>().type.toEqual(getNames());
  });

  test("does NOT equal expected value", () => {
    expect<{ first: string; last: string }>().type.not.toEqual(getNames());

    expect<{ first: string; last?: string }>().type.not.toEqual(getNames());
  });
});

describe("received value", () => {
  test("equals expected type", () => {
    expect(getNames()).type.toEqual<{ first: string; last?: string }>();
    expect(getNames()).type.toEqual<Names>();

    expect(getNames()).type.toEqual<{ first: string; last: string }>();
  });

  test("does NOT equal expected type", () => {
    expect(getNames()).type.not.toEqual<{ first: string; last: string }>();

    expect(getNames()).type.not.toEqual<{ first: string; last?: string }>();
  });

  test("equals expected value", () => {
    expect({ height: 14, width: 25 }).type.toEqual(getSize());

    expect({ height: 14 }).type.toEqual(getSize());
  });

  test("does NOT equal expected value", () => {
    expect({ height: 14 }).type.not.toEqual(getSize());

    expect({ height: 14, width: 25 }).type.not.toEqual(getSize());
  });
});
