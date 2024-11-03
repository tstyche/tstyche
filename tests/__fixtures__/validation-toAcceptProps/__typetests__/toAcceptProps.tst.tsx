import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toAcceptProps<{ test: false }>();
  });

  test("must be of a function or class type", () => {
    expect({ a: "sample" }).type.toAcceptProps({ test: false });
  });
});

describe("type argument for 'Source'", () => {
  test("must be of a function or class type", () => {
    expect<{ a: string }>().type.not.toAcceptProps({});
  });
});

describe("argument for 'target'", () => {
  test("must be provided", () => {
    expect(() => <>{"test"}</>).type.toAcceptProps();
  });

  test("must be of object type", () => {
    expect(() => <>{"test"}</>).type.toAcceptProps("nope");
  });
});

describe("type argument for 'Target'", () => {
  test("must be of object type", () => {
    expect(() => <>{"test"}</>).type.toAcceptProps<any>();
    expect(() => <>{"test"}</>).type.toAcceptProps<never>();

    expect(() => <>{"test"}</>).type.toAcceptProps<string>();

    expect(() => <>{"test"}</>).type.toAcceptProps<
      { test: string } | { test: number }
    >();
  });
});
