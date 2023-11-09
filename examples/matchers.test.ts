/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import { describe, expect, test } from "tstyche";

interface Matchers<R, T = unknown> {
  [key: string]: (expected: T) => R;
}

describe("Matchers", () => {
  test("type arguments", () => {
    expect<Matchers<void, string>>().type.not.toRaiseError();

    expect<Matchers<void>>().type.not.toRaiseError();

    expect<Matchers>().type.toRaiseError("requires between 1 and 2 type arguments");
  });
});
