import { describe, expect, test } from "tstyche";

describe.skip("is skipped describe?", () => {
  test("is skipped?", () => {
    expect<void>().type.toBeVoid();
  });
});
