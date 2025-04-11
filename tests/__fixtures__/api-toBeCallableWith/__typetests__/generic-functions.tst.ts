import { describe, expect, test } from "tstyche";

function firstItem<T>(target: Array<T>): T | undefined {
  return target[0];
}

function forEach<T>(target: Array<T>, callback: (element: T) => void): void {
  for (const element of target) {
    callback(element);
  }
}

function getLonger<T extends { length: number }>(a: T, b: T) {
  return a.length >= b.length ? a : b;
}

describe("when target is an expression", () => {
  test("can be called with the given argument", () => {
    expect(firstItem).type.toBeCallableWith(["a", "b", "c"]);
    expect(firstItem).type.not.toBeCallableWith(["a", "b", "c"]); // fail
  });

  test("cannot be called without arguments", () => {
    expect(firstItem).type.toBeCallableWith();
    expect(firstItem).type.not.toBeCallableWith(); // fail: Expected 1 arguments, but got 0.
  });

  test("can be called with the given arguments", () => {
    expect(forEach).type.toBeCallableWith(["1", "2"], (_n: string) => {});
    expect(forEach).type.not.toBeCallableWith(["1", "2"], (_n: string) => {}); // fail

    expect(getLonger).type.toBeCallableWith([1, 2], [1, 2, 3]);
    expect(getLonger).type.not.toBeCallableWith([1, 2], [1, 2, 3]); // fail

    expect(getLonger).type.toBeCallableWith("one", "two");
    expect(getLonger).type.not.toBeCallableWith("one", "two"); // fail
  });

  test("cannot be called with the given arguments", () => {
    expect(forEach).type.not.toBeCallableWith(["1", "2"], (_n: number) => {});
    expect(forEach).type.toBeCallableWith(["1", "2"], (_n: number) => {}); // fail

    expect(getLonger).type.not.toBeCallableWith("one", ["two"]);
    expect(getLonger).type.toBeCallableWith("one", ["two"]); // fail

    expect(getLonger).type.not.toBeCallableWith(1, 2);
    expect(getLonger).type.toBeCallableWith(1, 2); // fail
  });
});
