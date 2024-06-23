import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toAcceptProps<{ test: void }>();
  });

  test("must be of a function or class type", () => {
    expect({ a: "sample" }).type.toAcceptProps({ test: false });
  });
});

describe("type argument for 'Source'", () => {
  test("must be of a function or class type", () => {
    expect<{ a: string }>().type.not.toAcceptProps();
  });
});
