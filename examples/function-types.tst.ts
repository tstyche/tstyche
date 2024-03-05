import { describe, expect, test } from "tstyche";

declare function takesNone(): void;
declare function takesOne(a: number): void;
declare function takesTwo(a: string, b?: number): void;

describe("function types", () => {
  test("does not take arguments", () => {
    expect(takesNone).type.toBe<() => void>();
  });

  test("takes one argument", () => {
    expect(takesOne).type.toBe<(a: number) => void>();
  });

  test("takes two arguments", () => {
    expect(takesTwo).type.toBe<(a: string, b?: number) => void>();
  });
});
