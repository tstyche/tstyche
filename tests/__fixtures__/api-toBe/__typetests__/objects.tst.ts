import { expect, test } from "tstyche";

test("edge cases", () => {
  expect<{ a: string } | { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } | { a: string }>().type.not.toBe<{ a: string }>(); // fail

  expect<{ a: string } | { b: string }>().type.not.toBe<{ a: string }>();
  expect<{ a: string } | { b: string }>().type.toBe<{ a: string }>(); // fail

  expect<{ a: string } & { a: string }>().type.toBe<{ a: string }>();
  expect<{ a: string } & { a: string }>().type.not.toBe<{ a: string }>(); // fail

  expect<{ a: string } & { b: string }>().type.not.toBe<{ a: string }>();
  expect<{ a: string } & { b: string }>().type.toBe<{ a: string }>(); // fail

  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { a: string }>().type.not.toBe<{ a: string }>(); // fail

  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.not.toBe<{ a: string }>();
  expect<(({ a: string } & { a: string }) | { a: string }) & { b: string }>().type.toBe<{ a: string }>(); // fail

  expect<{ a: string }>().type.toBe<{ a: string } | { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } | { a: string }>(); // fail

  expect<{ a: string }>().type.not.toBe<{ a: string } | { b: string }>();
  expect<{ a: string }>().type.toBe<{ a: string } | { b: string }>(); // fail

  expect<{ a: string }>().type.toBe<{ a: string } & { a: string }>();
  expect<{ a: string }>().type.not.toBe<{ a: string } & { a: string }>(); // fail

  expect<{ a: string }>().type.not.toBe<{ a: string } & { b: string }>();
  expect<{ a: string }>().type.toBe<{ a: string } & { b: string }>(); // fail

  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>();
  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { a: string }>(); // fail

  expect<{ a: string }>().type.not.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>();
  expect<{ a: string }>().type.toBe<(({ a: string } & { a: string }) | { a: string }) & { b: string }>(); // fail
});
