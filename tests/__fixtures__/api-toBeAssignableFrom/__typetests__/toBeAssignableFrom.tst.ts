import { describe, expect, test } from "tstyche";

interface Names {
  first: string;
  last?: string;
}

describe("source type", () => {
  test("is assignable target expression?", () => {
    expect<Names>().type.toBeAssignableFrom({ first: "Rose" });
    expect<Names>().type.toBeAssignableFrom({ first: "Rose", last: "Smith" });
    expect<Names>().type.toBeAssignableFrom({ first: "Rose", last: undefined });

    expect<Names>().type.toBeAssignableFrom({ middle: "O." });
  });

  test("is NOT assignable target expression?", () => {
    expect<Names>().type.not.toBeAssignableFrom({ middle: "O." });

    expect<Names>().type.not.toBeAssignableFrom({ first: "Rose" });
  });

  test("is assignable target type?", () => {
    expect<Names>().type.toBeAssignableFrom<{ first: string }>();
    expect<Names>().type.toBeAssignableFrom<{ first: string; last: string }>();
    expect<Names>().type.toBeAssignableFrom<{ first: string; last: undefined }>();
    expect<Names>().type.toBeAssignableFrom<{ first: string; last?: string }>();

    expect<Names>().type.toBeAssignableFrom<{ middle: string }>();
  });

  test("is NOT assignable target type?", () => {
    expect<Names>().type.not.toBeAssignableFrom<{ middle: string }>();

    expect<Names>().type.not.toBeAssignableFrom<{ first: string }>();
  });
});

describe("source expression", () => {
  test("is assignable target expression?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom({ first: "Rose", last: "Smith" });

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom({ middle: "O." });
  });

  test("is NOT assignable target expression?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableFrom({ middle: "O." });

    expect({ first: "Jane" }).type.not.toBeAssignableFrom({ first: "Rose" });
  });

  test("is assignable target type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom<{ first: string; last: string }>();

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom<{ middle: string }>();
  });

  test("is NOT assignable type?", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableFrom<{ middle: string }>();

    expect({ first: "Jane" }).type.not.toBeAssignableFrom<{ first: string }>();
  });
});
