import { describe, expect, test } from "tstyche";

interface Names {
  first: string;
  last?: string;
}

describe("when source is a type", () => {
  test("is assignable from type of the target expression", () => {
    expect<Names>().type.toBeAssignableFrom({ first: "Rose" });
    expect<Names>().type.toBeAssignableFrom({ first: "Rose", last: "Smith" });
    expect<Names>().type.toBeAssignableFrom({ first: "Rose", last: undefined });

    expect<Names>().type.toBeAssignableFrom({ middle: "O." }); // fail
  });

  test("is NOT assignable from type of the target expression", () => {
    expect<Names>().type.not.toBeAssignableFrom({ middle: "O." });

    expect<Names>().type.not.toBeAssignableFrom({ first: "Rose" }); // fail
  });

  test("is assignable from the target type", () => {
    expect<Names>().type.toBeAssignableFrom<{ first: string }>();
    expect<Names>().type.toBeAssignableFrom<{ first: string; last: string }>();
    expect<Names>().type.toBeAssignableFrom<{ first: string; last: undefined }>();
    expect<Names>().type.toBeAssignableFrom<{ first: string; last?: string }>();

    expect<Names>().type.toBeAssignableFrom<{ middle: string }>(); // fail
  });

  test("is NOT assignable from the target type", () => {
    expect<Names>().type.not.toBeAssignableFrom<{ middle: string }>();

    expect<Names>().type.not.toBeAssignableFrom<{ first: string }>(); // fail
  });
});

describe("when source is an expression", () => {
  test("is assignable from type of the target expression.", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom({ first: "Rose", last: "Smith" });

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom({ middle: "O." }); // fail
  });

  test("is NOT assignable from type of the target expression.", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableFrom({ middle: "O." });

    expect({ first: "Jane" }).type.not.toBeAssignableFrom({ first: "Rose" }); // fail
  });

  test("is assignable from the target type", () => {
    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom<{ first: string; last: string }>();

    expect({ first: "Jane", last: "Swan" }).type.toBeAssignableFrom<{ middle: string }>(); // fail
  });

  test("is NOT assignable from the target type", () => {
    expect({ first: "Jane", last: "Swan" }).type.not.toBeAssignableFrom<{ middle: string }>();

    expect({ first: "Jane" }).type.not.toBeAssignableFrom<{ first: string }>(); // fail
  });
});
