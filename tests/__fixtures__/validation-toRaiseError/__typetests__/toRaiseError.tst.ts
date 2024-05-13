import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toRaiseError("one");
  });
});

describe("argument for 'target'", () => {
  function check(a: string) {
    return a;
  }

  test("must be of type 'string | number'", () => {
    // @ts-expect-error test test test
    expect(check(123)).type.toRaiseError(true, [2345]);
  });
});
