import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toHaveProperty("runTest");
  });

  test("must be of an object type", () => {
    expect("sample").type.toHaveProperty("runTest");
  });
});

describe("type argument for 'source'", () => {
  test("must be of an object type", () => {
    enum Color {
      Red,
      Green,
      Blue,
    }

    const enum Result {
      Fail,
      Pass,
    }

    expect<{}>().type.not.toHaveProperty("abc");

    expect<any>().type.toHaveProperty("runTest");
    expect<never>().type.toHaveProperty("runTest");
    expect(null).type.toHaveProperty("runTest");
    expect<"one" | "two">().type.toHaveProperty("runTest");
    expect<Color>().type.toHaveProperty("Red");
    expect<Result>().type.toHaveProperty("Fail");
  });
});

describe("argument for 'key'", () => {
  test("must be provided", () => {
    // @ts-expect-error!
    expect<{ test: () => void }>().type.toHaveProperty();
  });

  test("must be of type a string, number or symbol", () => {
    // @ts-expect-error!
    expect<{ test: () => void }>().type.toHaveProperty(["test"]);
  });
});
