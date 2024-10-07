import { describe, omit, test } from "tstyche";

describe("argument for 'object'", () => {
  test("must be provided", () => {
    omit();
  });
});

describe("argument for 'keys'", () => {
  test("must be provided", () => {
    omit({ a: "test" });
  });
});
