import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toMatch<{ test: void }>();
  });
});

describe("argument for 'key'", () => {
  test("must be provided", () => {
    expect<{ test: void }>().type.toMatch();
  });
});
