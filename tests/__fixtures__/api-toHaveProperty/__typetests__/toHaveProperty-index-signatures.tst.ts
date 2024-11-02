import { describe, expect, test } from "tstyche";

const enum Result {
  Fail = 0,
  Pass = 1,
}
const enum Direction {
  Up = "up",
  Down = "down",
}

describe("index signatures", () => {
  test("when key is string", () => {
    expect<Record<string, unknown>>().type.toHaveProperty(123);
    expect<Record<string, unknown>>().type.toHaveProperty("123");
    expect<Record<string, unknown>>().type.toHaveProperty("abc");
    expect<Record<string, unknown>>().type.toHaveProperty(Result.Fail);
    expect<Record<string, unknown>>().type.toHaveProperty(Direction.Down);
  });

  test("when key is number", () => {
    expect<Record<number, unknown>>().type.toHaveProperty(123);
    expect<Record<number, unknown>>().type.toHaveProperty("123");
    expect<Record<number, unknown>>().type.toHaveProperty(Result.Fail);

    expect<Record<number, unknown>>().type.not.toHaveProperty("abc");
    expect<Record<number, unknown>>().type.not.toHaveProperty(Direction.Up);
  });

  test("when key is string symbol", () => {
    // TODO
  });

  test("when key is enum member", () => {
    // TODO
  });

  test("when key is string literal", () => {
    expect<Record<`id_${string}`, unknown>>().type.toHaveProperty("id_345");

    expect<Record<`id_${string}`, unknown>>().type.not.toHaveProperty("it_678");
  });
});
