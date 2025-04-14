import { describe, expect, test } from "tstyche";

class First<T> {
  a: T;
  constructor(a: T) {
    this.a = a;
  }
}

class Second<T> {
  target: Array<T>;
  callback: (element: T) => void;
  constructor(target: Array<T>, callback: (element: T) => void) {
    this.target = target;
    this.callback = callback;
  }
}

describe("when target is an expression", () => {
  test("is constructable with the given argument", () => {
    expect(First).type.toBeConstructableWith(["a", "b", "c"]);
    expect(First).type.not.toBeConstructableWith(["a", "b", "c"]); // fail
  });

  test("is not constructable without arguments", () => {
    expect(First).type.toBeConstructableWith();
    expect(First).type.not.toBeConstructableWith(); // fail: Expected 1 arguments, but got 0.
  });

  test("is constructable with the given arguments", () => {
    expect(Second).type.toBeConstructableWith(["1", "2"], (_n: string) => {});
    expect(Second).type.not.toBeConstructableWith(["1", "2"], (_n: string) => {}); // fail

    expect(Second<number | string>).type.toBeConstructableWith(["1", 2], (_n: string | number) => {});
    expect(Second<number | string>).type.not.toBeConstructableWith(["1", 2], (_n: string | number) => {}); // fail
  });

  test("is not constructable with the given arguments", () => {
    expect(Second).type.not.toBeConstructableWith(["1", "2"], (_n: number) => {});
    expect(Second).type.toBeConstructableWith(["1", "2"], (_n: number) => {}); // fail

    expect(Second).type.not.toBeConstructableWith(["1", 2], (_n: string) => {});
    expect(Second).type.toBeConstructableWith(["1", 2], (_n: string) => {}); // fail
  });
});
