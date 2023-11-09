import { context, expect, test } from "tstyche";

context("is context?", () => {
  test("is void?", () => {
    expect<void>().type.toBeVoid();
  });
});

context("is parent context?", () => {
  test("is never?", () => {
    expect<never>().type.toBeNever();
  });

  context("is nested context?", function () {
    test("is string?", () => {
      expect<string>().type.toBeString();
    });
  });
});

test("is string still?", () => {
  expect<string>().type.toBeString();
});
