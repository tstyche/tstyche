import { describe, expect, it, test } from "tstyche";

it.todo("is todo?");

it("is string?", () => {
  expect<string>().type.toBe<string>();
});

describe.only("is describe?", () => {
  test.todo("is todo too?");

  test("is void?", () => {
    expect<void>().type.toBe<void>();
  });

  test.skip("is never?", () => {
    expect<never>().type.toBe<never>();
  });
});

test("is never too?", () => {
  expect<never>().type.toBe<never>();
});
