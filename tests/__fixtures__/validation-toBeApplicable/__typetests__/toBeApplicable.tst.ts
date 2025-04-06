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

  test("must be of a function type", () => {
    class Fixture {
      @(expect("sample").type.toBeApplicable)
      toString() {
        return "Fixture";
      }
    }
  });
});
