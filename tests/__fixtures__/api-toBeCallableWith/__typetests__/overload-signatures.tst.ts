import { describe, expect, test } from "tstyche";

function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d != null && y != null) {
    return new Date(y, mOrTimestamp, d);
  }

  return new Date(mOrTimestamp);
}

declare function t(name: string, cb: () => Promise<unknown>): Promise<void>;
declare function t(name: string, cb: () => unknown): void;

describe("when target is an expression", () => {
  test("is callable with the given argument", () => {
    expect(makeDate).type.toBeCallableWith(12345678);
    expect(makeDate).type.not.toBeCallableWith(12345678); // fail
  });

  test("is callable with the given arguments", () => {
    expect(makeDate).type.toBeCallableWith(4, 5, 6);
    expect(makeDate).type.not.toBeCallableWith(4, 5, 6); // fail

    expect(t).type.toBeCallableWith("one", () => {});
    expect(t).type.not.toBeCallableWith("one", () => {}); // fail

    expect(t).type.toBeCallableWith("two", () => Promise.resolve());
    expect(t).type.not.toBeCallableWith("two", () => Promise.resolve()); // fail
  });

  test("is not callable without arguments", () => {
    expect(makeDate).type.not.toBeCallableWith();
    expect(makeDate).type.toBeCallableWith(); // fail: Expected 1-3 arguments, but got 0.

    expect(t).type.not.toBeCallableWith();
    expect(t).type.toBeCallableWith(); // fail: Expected 2 arguments, but got 0.
  });

  test("is not callable with the given argument", () => {
    expect(t).type.not.toBeCallableWith("nope");
    expect(t).type.toBeCallableWith("nope"); // fail: Expected 2 arguments, but got 1.
  });

  test("is not callable with the given arguments", () => {
    expect(makeDate).type.not.toBeCallableWith(2, 3);
    expect(makeDate).type.toBeCallableWith(2, 3); // fail: No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.

    expect(makeDate).type.not.toBeCallableWith(4, 5, 6, 7);
    expect(makeDate).type.toBeCallableWith(4, 5, 6, 7); // fail: Expected 1-3 arguments, but got 4.
  });
});
