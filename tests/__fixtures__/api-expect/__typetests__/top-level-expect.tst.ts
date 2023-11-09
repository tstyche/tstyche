import { describe, expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBeString();
});

expect<void>().type.toBeUndefined();

describe("is describe?", () => {
  test("is number?", () => {
    expect<number>().type.toBeNumber();
    expect<number>().type.toBeVoid();
  });
});

expect<null>().type.toBeNull();
expect<number>().type.toBeVoid();
