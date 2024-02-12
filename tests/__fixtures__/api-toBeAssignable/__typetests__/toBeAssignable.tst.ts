import { describe, expect, test } from "tstyche";

interface Names {
  first: string;
  last?: string;
}

describe("received type", () => {
  test("is assignable expected value?", () => {
    expect<Names>().type.toBeAssignable({ first: "Rose" });
    expect<Names>().type.toBeAssignable({ first: "Rose", last: "Smith" });
    expect<Names>().type.toBeAssignable({ first: "Rose", last: undefined });

    expect<Names>().type.toBeAssignable({ middle: "O." });
  });

  test("is NOT assignable expected value?", () => {
    expect<Names>().type.not.toBeAssignable({ middle: "O." });

    expect<Names>().type.not.toBeAssignable({ first: "Rose" });
  });

  test("is assignable expected type?", () => {
    expect<Names>().type.toBeAssignable<{ first: string }>();
    expect<Names>().type.toBeAssignable<{ first: string; last: string }>();
    expect<Names>().type.toBeAssignable<{ first: string; last: undefined }>();
    expect<Names>().type.toBeAssignable<{ first: string; last?: string }>();

    expect<Names>().type.toBeAssignable<{ middle: string }>();
  });

  test("is NOT assignable expected type?", () => {
    expect<Names>().type.not.toBeAssignable<{ middle: string }>();

    expect<Names>().type.not.toBeAssignable<{ first: string }>();
  });
});

describe("received value", () => {
  test("is assignable expected value?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignable({
      first: "Rose",
      last: "Smith",
    });

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignable({
      middle: "O.",
    });
  });

  test("is NOT assignable expected value?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignable({
      middle: "O.",
    });

    expect({ first: "Jane" }).type.not.toBeAssignable({ first: "Rose" });
  });

  test("is assignable expected type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignable<{
      first: string;
      last: string;
    }>();

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignable<{
      middle: string;
    }>();
  });

  test("is NOT assignable type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignable<{
      middle: string;
    }>();

    expect({ first: "Jane" }).type.not.toBeAssignable<{ first: string }>();
  });
});
