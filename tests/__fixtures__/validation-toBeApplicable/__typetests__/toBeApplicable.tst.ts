import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    class Fixture {
      @(expect().type.toBeApplicable)
      toString() {
        return "Fixture";
      }
    }
  });
});
