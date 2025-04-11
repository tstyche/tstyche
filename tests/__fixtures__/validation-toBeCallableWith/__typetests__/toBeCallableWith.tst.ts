import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeCallableWith(false);
  });

  test("must be of a function type", () => {
    expect("sample").type.toBeCallableWith(false);
  });

  test("must be an identifier or instantiation expression", () => {
    expect(() => "sample").type.toBeCallableWith(false);
  });
});
