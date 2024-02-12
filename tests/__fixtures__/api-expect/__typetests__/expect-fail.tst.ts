import { describe, expect, test } from "tstyche";

expect<string>().type.toBeString();
expect.fail<string>().type.toBeString();

expect.fail<never>().type.toBeString();

describe("is describe?", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
    expect.fail<string>().type.toBeString();

    expect.fail<never>().type.toBeVoid();
  });
});

test("is number?", () => {
  expect<number>().type.toBeNumber();
  expect.fail<number>().type.toBeNumber();

  expect.fail<never>().type.toBeVoid();
});
