import { expect, test } from "tstyche";

function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d != null && y != null) {
    return new Date(y, mOrTimestamp, d);
  }

  return new Date(mOrTimestamp);
}

test("makeDate", () => {
  expect(makeDate(12345678)).type.toBe<Date>();
  expect(makeDate(4, 5, 6)).type.toBe<Date>();

  expect(makeDate).type.not.toBeCallableWith();
  expect(makeDate).type.not.toBeCallableWith(2, 3);
  expect(makeDate).type.not.toBeCallableWith(7, 8, 9, 10);
});

function getValueWithDefault(): "default";
function getValueWithDefault<T>(arg: T): T;
function getValueWithDefault<T>(arg?: T): T | "default" {
  return arg ?? "default";
}

test("getValueWithDefault", () => {
  expect(getValueWithDefault()).type.toBe<"default">();

  expect(getValueWithDefault(123)).type.toBe<123>();
  expect(getValueWithDefault("abc")).type.toBe<"abc">();
  expect(getValueWithDefault(true)).type.toBe<true>();
});
