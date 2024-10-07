import { describe, pick, test } from "tstyche";

describe("argument for 'object'", () => {
  test("must be provided", () => {
    pick();
  });
});

describe("argument for 'keys'", () => {
  test("must be provided", () => {
    pick({ a: "test" });
  });

  test("must be valid key", () => {
    pick({ a: "test" }, "b");
  });
});
