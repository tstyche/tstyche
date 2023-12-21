import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeCallableWith();
  });

  test("expression must be callable", () => {
    expect("sample").type.toBeCallableWith();
  });

  test("type expression must be callable", () => {
    expect<{ a: 123 }>().type.toBeCallableWith();
  });
});

describe("argument for 'Target'", () => {
  test("must be of tuple type", () => {
    // @ts-expect-error test
    expect<() => void>().type.toBeCallableWith<null>();
  });
});
