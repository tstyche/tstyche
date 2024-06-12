import { describe, expect, test } from "tstyche";

describe("readonly", () => {
  test("Array", () => {
    expect<{ a: Array<string>; b: number }>().type.toMatch<{ a: Array<string> }>();
    expect<{ a: ReadonlyArray<string>; b: number }>().type.not.toMatch<{ a: Array<string> }>();
    expect<{ a: Readonly<Array<string>>; b: number }>().type.not.toMatch<{ a: Array<string> }>();

    expect<Readonly<Array<string>>>().type.toBe<ReadonlyArray<string>>();
  });

  test("Map", () => {
    expect<{ a: Map<string, number>; b: number }>().type.toMatch<{ a: Map<string, number> }>();
    expect<{ a: ReadonlyMap<string, number>; b: number }>().type.not.toMatch<{ a: Map<string, number> }>();
  });

  test("Set", () => {
    expect<{ a: Set<string>; b: number }>().type.toMatch<{ a: Set<string> }>();
    expect<{ a: ReadonlySet<string>; b: number }>().type.not.toMatch<{ a: Set<string> }>();
  });

  test("property", () => {
    expect<{ readonly a: string }>().type.not.toMatch<{ a: string }>();
    expect<Readonly<{ a: string }>>().type.not.toMatch<{ a: string }>();

    expect<Readonly<{ a: string }>>().type.toBe<{ readonly a: string }>();
  });
});
