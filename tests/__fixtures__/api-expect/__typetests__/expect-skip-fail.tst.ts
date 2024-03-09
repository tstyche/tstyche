import { describe, expect, test } from "tstyche";

expect.skip.fail<string>().type.toBeString();
expect.fail<string>().type.toBeString();

expect.skip.fail(() => {
  expect<number>().type.toBeNumber();
}).type.toBe<void>();

describe("is describe?", () => {
  test("is string?", () => {
    expect.skip.fail<string>().type.toBeString();
    expect.fail<string>().type.toBeString();
  });
});

test("is number?", () => {
  expect.skip.fail<number>().type.toBeNumber();
  expect.fail<number>().type.toBeNumber();
});
