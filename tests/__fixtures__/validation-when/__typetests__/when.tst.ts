import { describe, test, when } from "tstyche";

describe("argument for 'target'", () => {
  test("must be provided", () => {
    when().isCalledWith({ valid: true });
  });

  test("is rejected type?", () => {
    when("abc" as any).isCalledWith({ valid: true });
    when("abc" as never).isCalledWith({ valid: true });
  });
});
