import { describe, expect, it, test } from "tstyche";

it.todo("is todo?");

it("is string?", () => {
  expect<string>().type.toBeString();
});

describe.only("is describe?", () => {
  test.todo("is todo too?");

  test("is void?", () => {
    expect<void>().type.toBeVoid();
  });

  test.skip("is never?", () => {
    expect<never>().type.toBeNever();
  });
});

test("is never too?", () => {
  expect<never>().type.toBeNever();
});
