import { describe, expect, test } from "tstyche";

const $dummy = () => "test";
const Dummy = () => "test";
const _dummy = () => "test";
const dummy = () => "test";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toAcceptProps({ test: false });
  });

  test("must be of a function or class type", () => {
    expect({ a: "sample" }).type.toAcceptProps({ test: false });
  });

  test("must begin with an uppercase letter", () => {
    expect(dummy).type.toAcceptProps({});
  });

  test("allowed names", () => {
    expect(Dummy).type.toAcceptProps({});
    expect($dummy).type.toAcceptProps({});
    expect(_dummy).type.toAcceptProps({});
  });
});

describe("type argument for 'source'", () => {
  test("must be of a function or class type", () => {
    expect<{ a: string }>().type.not.toAcceptProps({});
  });
});

describe("argument for 'target'", () => {
  test("must be provided", () => {
    // @ts-expect-error!
    expect(Dummy).type.toAcceptProps();
  });

  test("must be an object literal", () => {
    // @ts-expect-error!
    expect(Dummy).type.toAcceptProps("nope");
  });

  test("must only contain key-value pairs", () => {
    const b = "no";
    const c = { c: true };
    expect(Dummy).type.toAcceptProps({ a: "yes", b, ...c });
  });

  test("property keys must be static identifiers or string literals", () => {
    expect(Dummy).type.toAcceptProps({ ["a"]: "nope" });
  });
});
