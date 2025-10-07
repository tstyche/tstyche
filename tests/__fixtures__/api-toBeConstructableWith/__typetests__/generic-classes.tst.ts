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

describe("when source is an expression", () => {
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

type FirstConstructor = new <T>(a: T) => First<T>;
type SecondConstructor = new <T>(target: Array<T>, callback: (element: T) => void) => Second<T>;

describe("when source is a type", () => {
  test("is constructable with the given argument", () => {
    expect<FirstConstructor>().type.toBeConstructableWith(["a", "b", "c"]);
    expect<FirstConstructor>().type.not.toBeConstructableWith(["a", "b", "c"]); // fail
  });

  test("is not constructable without arguments", () => {
    expect<FirstConstructor>().type.toBeConstructableWith();
    expect<FirstConstructor>().type.not.toBeConstructableWith(); // fail: Expected 1 arguments, but got 0.
  });

  test("is constructable with the given arguments", () => {
    expect<SecondConstructor>().type.toBeConstructableWith(["1", "2"], (_n: string) => {});
    expect<SecondConstructor>().type.not.toBeConstructableWith(["1", "2"], (_n: string) => {}); // fail
  });

  test("is not constructable with the given arguments", () => {
    expect<SecondConstructor>().type.not.toBeConstructableWith(["1", "2"], (_n: number) => {});
    expect<SecondConstructor>().type.toBeConstructableWith(["1", "2"], (_n: number) => {}); // fail

    expect<SecondConstructor>().type.not.toBeConstructableWith(["1", 2], (_n: string) => {});
    expect<SecondConstructor>().type.toBeConstructableWith(["1", 2], (_n: string) => {}); // fail
  });
});
