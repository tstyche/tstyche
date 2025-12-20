import { expect, test } from "tstyche";

type ValueAtKeyA<T, K extends PropertyKey, FallBack = unknown> = K extends keyof T ? T[K] : FallBack;
type ValueAtKeyB<T, K extends string | number, FallBack = unknown> = K extends keyof T ? T[K] : FallBack;

declare function get<K extends PropertyKey>(key: K): <T>(a: T) => ValueAtKeyA<T, K>;

test("returned function", () => {
  expect(get("length")).type.toBe<<T>(a: T) => ValueAtKeyA<T, "length">>();
  expect(get("length")).type.not.toBe<<T>(a: T) => ValueAtKeyB<T, "length">>();
});
