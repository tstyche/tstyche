import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toHaveProperty("runTest");
  });

  test("must be of an object type", () => {
    expect("sample").type.toHaveProperty("runTest");
  });
});

describe("type argument for 'Source'", () => {
  test("must be of an object type", () => {
    expect<{}>().type.not.toHaveProperty("abc");

    expect<any>().type.toHaveProperty("runTest");
    expect<never>().type.toHaveProperty("runTest");
    expect(null).type.toHaveProperty("runTest");
    expect<"one" | "two">().type.toHaveProperty("runTest");
  });
});

describe("argument for 'key'", () => {
  test("must be provided", () => {
    // @ts-expect-error testing purpose
    expect<{ test: () => void }>().type.toHaveProperty();
  });

  test("must be of type 'string | number | symbol'", () => {
    // @ts-expect-error testing purpose
    expect<{ test: () => void }>().type.toHaveProperty(["test"]);
  });
});
