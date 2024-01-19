import { describe, expect, test } from "tstyche";

declare function takesNone(): void;
declare function takesOne(a: number): void;
declare function takesTwo(a: string, b?: number): void;

describe("function types", () => {
  test("does not take arguments", () => {
    expect(takesNone).type.toEqual<() => void>();
  });

  test("takes one argument", () => {
    expect(takesOne).type.toEqual<(a: number) => void>();
  });

  test("takes two arguments", () => {
    expect(takesTwo).type.toEqual<(a: string, b?: number) => void>();
  });
});
