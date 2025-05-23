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
  test("is callable with the given argument", () => {
    expect(firstItem).type.toBeCallableWith(["a", "b", "c"]);
    expect(firstItem).type.not.toBeCallableWith(["a", "b", "c"]); // fail
  });

  test("is not callable without arguments", () => {
    expect(firstItem).type.toBeCallableWith();
    expect(firstItem).type.not.toBeCallableWith(); // fail: Expected 1 arguments, but got 0.
  });

  test("is callable with the given arguments", () => {
    expect(forEach).type.toBeCallableWith(["1", "2"], (_n: string) => {});
    expect(forEach).type.not.toBeCallableWith(["1", "2"], (_n: string) => {}); // fail

    expect(getLonger).type.toBeCallableWith([1, 2], [1, 2, 3]);
    expect(getLonger).type.not.toBeCallableWith([1, 2], [1, 2, 3]); // fail

    expect(getLonger).type.toBeCallableWith("one", "two");
    expect(getLonger).type.not.toBeCallableWith("one", "two"); // fail

    expect(getLonger<string | Array<number>>).type.toBeCallableWith("zero", [123]);
    expect(getLonger<string | Array<number>>).type.not.toBeCallableWith("zero", [123]); // fail
  });

  test("is not callable with the given arguments", () => {
    expect(forEach).type.not.toBeCallableWith(["1", "2"], (_n: number) => {});
    expect(forEach).type.toBeCallableWith(["1", "2"], (_n: number) => {}); // fail

    expect(getLonger).type.not.toBeCallableWith("zero", [123]);
    expect(getLonger).type.toBeCallableWith("zero", [123]); // fail

    expect(getLonger).type.not.toBeCallableWith(1, 2);
    expect(getLonger).type.toBeCallableWith(1, 2); // fail
  });
});
