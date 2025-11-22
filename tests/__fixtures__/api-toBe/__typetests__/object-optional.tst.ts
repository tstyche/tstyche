import { expect, test } from "tstyche";

test("is the same?", () => {
  expect<{ a?: string }>().type.toBe<{ a?: string }>();
  expect<{ a?: string }>().type.toBe<{ a: string }>(); // fail

  expect<{ a: string; b?: number }>().type.toBe<{ a: string; b?: number }>();
  expect<{ a: string; b?: number }>().type.toBe<{ a: string; b: number }>(); // fail

  expect<Partial<{ a: string }>>().type.toBe<{ a?: string }>();
  expect<Partial<{ a: string }>>().type.toBe<{ a: string }>(); // fail

  expect<Required<{ a?: string }>>().type.toBe<{ a: string }>();
  expect<Required<{ a?: string }>>().type.toBe<{ a?: string }>(); // fail
});

test("is NOT the same?", () => {
  expect<{ a?: string }>().type.not.toBe<{ a: string }>();
  expect<{ a?: string }>().type.not.toBe<{ a?: string }>(); // fail

  expect<{ a: string; b?: number }>().type.not.toBe<{ a: string; b: number }>();
  expect<{ a: string; b?: number }>().type.not.toBe<{ a: string; b?: number }>(); // fail

  expect<Partial<{ a: string }>>().type.not.toBe<{ a: string }>();
  expect<Partial<{ a: string }>>().type.not.toBe<{ a?: string }>(); // fail

  expect<Required<{ a?: string }>>().type.not.toBe<{ a?: string }>();
  expect<Required<{ a?: string }>>().type.not.toBe<{ a: string }>(); // fail
});
