import { describe, expect, test } from "tstyche";

describe("argument for 'Target'", () => {
  test("must be omitted or have at least one call signature", () => {
    expect(Date).type.toHaveCallSignatures();
    expect<string>().type.not.toHaveCallSignatures();

    expect(Date).type.toHaveCallSignatures<{}>(); // fail
    expect(Date).type.toHaveCallSignatures<{ new (): Date }>(); // fail
    expect<string>().type.not.toHaveCallSignatures<{}>(); // fail
  });
});
