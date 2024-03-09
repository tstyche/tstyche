import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeAssignableWith<{ test: void }>();
  });
});

describe("argument for 'target'", () => {
  test("must be provided", () => {
    expect<{ test: void }>().type.toBeAssignableWith();
  });
});
