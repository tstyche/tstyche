import { describe, expect, test } from "tstyche";

const enum Result {
  Fail,
  Pass,
}
const enum Direction {
  Up = "up",
  Down = "down",
}

describe("index signatures", () => {
  test("when key is string", () => {
    expect<Record<number, unknown>>().type.toHaveProperty(123);
    expect<Record<number, unknown>>().type.not.toHaveProperty("123");
  });

  test("when key is number", () => {
    expect<Record<number, unknown>>().type.toHaveProperty(123);
    expect<Record<number, unknown>>().type.not.toHaveProperty("123");
  });

  test("when key is string symbol", () => {
    // TODO
  });

  test("when key is enum member", () => {
    // TODO
  });

  test("when key is string literal", () => {
    // TODO
  });
});
