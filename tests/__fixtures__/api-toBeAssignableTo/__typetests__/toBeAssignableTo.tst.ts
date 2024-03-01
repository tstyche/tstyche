import { describe, expect, test } from "tstyche";

interface Names {
  first: string;
  last?: string;
}

describe("source type", () => {
  test("is assignable to target expression?", () => {
    expect<{ first: string }>().type.toBeAssignableTo({ first: "Jane" });

    expect<{ first?: string }>().type.toBeAssignableTo({ first: "Jane" });
  });

  test("is NOT assignable to target expression?", () => {
    expect<Names>().type.not.toBeAssignableTo({ first: "Rose", last: "Smith" });
    expect<Names>().type.not.toBeAssignableTo({ first: "Rose", last: undefined });
    expect<Names>().type.not.toBeAssignableTo({ middle: "O." });

    expect<{ first: string }>().type.not.toBeAssignableTo({ first: "Jane" });
  });

  test("is assignable to target type?", () => {
    expect<Names>().type.toBeAssignableTo<{ first: string }>();
    expect<Names>().type.toBeAssignableTo<{ first: string; last?: string }>();

    expect<Names>().type.toBeAssignableTo<{ middle: string }>();
  });

  test("is NOT assignable to target type?", () => {
    expect<Names>().type.not.toBeAssignableTo<{ first: string; last: string }>();
    expect<Names>().type.not.toBeAssignableTo<{ first: string; last: undefined }>();
    expect<Names>().type.not.toBeAssignableTo<{ middle: string }>();

    expect<Names>().type.not.toBeAssignableTo<{ first: string }>();
  });
});

describe("source expression", () => {
  test("is assignable to target expression?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableTo({ first: "Rose", last: "Smith" });

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableTo({ first: "Rose" });
  });

  test("is NOT assignable to target expression?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableTo({ first: "Rose" });

    expect({ first: "Jane" }).type.not.toBeAssignableTo({ first: "Rose" });
  });

  test("is assignable to target type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableTo<{ first: string; last: string }>();
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableTo<{ first: string; last?: string }>();

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableTo<{ middle: string }>();
  });

  test("is NOT assignable to type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableTo<{ middle: string }>();

    expect({ first: "Jane" }).type.not.toBeAssignableTo<{ first: string }>();
  });
});
