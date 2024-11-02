import { describe, expect, test } from "tstyche";

interface SymbolMap {
  [key: symbol]: unknown;
}

interface DataProps {
  [key: `data-${string}`]: string;
}

interface PropertyMap {
  [key: string | number | symbol]: string;
}

const enum Result {
  Fail = 0,
  Pass = 1,
}
type ResultMap = Record<Result, unknown>;

const enum Scroll {
  Up = "up",
  Down = "down",
}
type ScrollMap = Record<Scroll, unknown>;

describe("index signatures", () => {
  test("has expected string property key", () => {
    expect<Record<string, unknown>>().type.toHaveProperty(123);
    expect<Record<string, unknown>>().type.not.toHaveProperty(123); // fail

    expect<Record<string, unknown>>().type.toHaveProperty("123");
    expect<Record<string, unknown>>().type.not.toHaveProperty("123"); // fail

    expect<Record<string, unknown>>().type.toHaveProperty("abc");
    expect<Record<string, unknown>>().type.not.toHaveProperty("abc"); // fail

    expect<Record<string, unknown>>().type.toHaveProperty(Result.Fail);
    expect<Record<string, unknown>>().type.not.toHaveProperty(Result.Fail); // fail

    expect<Record<string, unknown>>().type.toHaveProperty(Scroll.Down);
    expect<Record<string, unknown>>().type.not.toHaveProperty(Scroll.Down); // fail

    expect<PropertyMap>().type.toHaveProperty("abc");
    expect<PropertyMap>().type.not.toHaveProperty("abc"); // fail
  });

  test("has expected number property key", () => {
    expect<Record<number, unknown>>().type.toHaveProperty(123);
    expect<Record<number, unknown>>().type.not.toHaveProperty(123); // fail

    expect<Record<number, unknown>>().type.toHaveProperty("123");
    expect<Record<number, unknown>>().type.not.toHaveProperty("123"); // fail

    expect<Record<number, unknown>>().type.toHaveProperty(Result.Fail);
    expect<Record<number, unknown>>().type.not.toHaveProperty(Result.Fail); // fail

    expect<PropertyMap>().type.toHaveProperty(123);
    expect<PropertyMap>().type.not.toHaveProperty(123); // fail
  });

  test("does not have expected number property key", () => {
    expect<Record<number, unknown>>().type.not.toHaveProperty("abc");
    expect<Record<number, unknown>>().type.toHaveProperty("abc"); // fail

    expect<Record<number, unknown>>().type.not.toHaveProperty(Scroll.Up);
    expect<Record<number, unknown>>().type.toHaveProperty(Scroll.Up); // fail
  });

  test("has expected symbol property key", () => {
    const symbolKey = Symbol("one");

    expect<SymbolMap>().type.toHaveProperty(symbolKey);
    expect<SymbolMap>().type.not.toHaveProperty(symbolKey); // fail

    expect<PropertyMap>().type.toHaveProperty(symbolKey);
    expect<PropertyMap>().type.not.toHaveProperty(symbolKey); // fail
  });

  test("has expected enum property key", () => {
    expect<ScrollMap>().type.toHaveProperty(Scroll.Up);
    expect<ScrollMap>().type.not.toHaveProperty(Scroll.Up); // fail

    expect<ResultMap>().type.toHaveProperty(Result.Pass);
    expect<ResultMap>().type.not.toHaveProperty(Result.Pass); // fail
  });

  test("does not have expected enum property key", () => {
    expect<ScrollMap>().type.not.toHaveProperty(Result.Fail);
    expect<ScrollMap>().type.toHaveProperty(Result.Fail); // fail

    expect<ResultMap>().type.not.toHaveProperty(Scroll.Down);
    expect<ResultMap>().type.toHaveProperty(Scroll.Down); // fail
  });

  test("has expected string literal property key", () => {
    expect<DataProps>().type.toHaveProperty("data-sample");
    expect<DataProps>().type.not.toHaveProperty("data-sample"); // fail
  });

  test("does not have expected string literal property key", () => {
    expect<DataProps>().type.not.toHaveProperty("date-sample");
    expect<DataProps>().type.toHaveProperty("date-sample"); // fail
  });
});
