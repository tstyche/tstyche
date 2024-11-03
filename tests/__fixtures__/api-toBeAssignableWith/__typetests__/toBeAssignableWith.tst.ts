import { describe, expect, test } from "tstyche";

interface Names {
  first: string;
  last?: string;
}

describe("source type", () => {
  test("is assignable target expression?", () => {
    expect<Names>().type.toBeAssignableWith({ first: "Rose" });
    expect<Names>().type.toBeAssignableWith({ first: "Rose", last: "Smith" });
    expect<Names>().type.toBeAssignableWith({ first: "Rose", last: undefined });

    expect<Names>().type.toBeAssignableWith({ middle: "O." });
  });

  test("is NOT assignable target expression?", () => {
    expect<Names>().type.not.toBeAssignableWith({ middle: "O." });

    expect<Names>().type.not.toBeAssignableWith({ first: "Rose" });
  });

  test("is assignable target type?", () => {
    expect<Names>().type.toBeAssignableWith<{ first: string }>();
    expect<Names>().type.toBeAssignableWith<{ first: string; last: string }>();
    expect<Names>().type.toBeAssignableWith<{
      first: string;
      last: undefined;
    }>();
    expect<Names>().type.toBeAssignableWith<{ first: string; last?: string }>();

    expect<Names>().type.toBeAssignableWith<{ middle: string }>();
  });

  test("is NOT assignable target type?", () => {
    expect<Names>().type.not.toBeAssignableWith<{ middle: string }>();

    expect<Names>().type.not.toBeAssignableWith<{ first: string }>();
  });
});

describe("source expression", () => {
  test("is assignable target expression?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableWith({
      first: "Rose",
      last: "Smith",
    });

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableWith({
      middle: "O.",
    });
  });

  test("is NOT assignable target expression?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableWith({
      middle: "O.",
    });

    expect({ first: "Jane" }).type.not.toBeAssignableWith({ first: "Rose" });
  });

  test("is assignable target type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableWith<{
      first: string;
      last: string;
    }>();

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableWith<{
      middle: string;
    }>();
  });

  test("is NOT assignable type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableWith<{
      middle: string;
    }>();

    expect({ first: "Jane" }).type.not.toBeAssignableWith<{ first: string }>();
  });
});
