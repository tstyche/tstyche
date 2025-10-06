import { describe, expect, test } from "tstyche";

class Point {
  x: number | string;
  y: number | string | undefined;

  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: string | number, y?: number) {
    this.x = x;
    this.y = y;
  }
}

class Test {
  name: string;
  cb: () => unknown | Promise<unknown>;

  constructor(name: string, cb: () => Promise<unknown>);
  constructor(name: string, cb: () => unknown) {
    this.name = name;
    this.cb = cb;
  }
}

describe("when source is an expression", () => {
  test("is constructable with the given argument", () => {
    expect(Point).type.toBeConstructableWith("0:0");
    expect(Point).type.not.toBeConstructableWith("0:0"); // fail
  });

  test("is constructable with the given arguments", () => {
    expect(Point).type.toBeConstructableWith(4, 5);
    expect(Point).type.not.toBeConstructableWith(4, 5); // fail

    expect(Test).type.toBeConstructableWith("one", () => {});
    expect(Test).type.not.toBeConstructableWith("one", () => {}); // fail

    expect(Test).type.toBeConstructableWith("two", () => Promise.resolve());
    expect(Test).type.not.toBeConstructableWith("two", () => Promise.resolve()); // fail
  });

  test("is not constructable without arguments", () => {
    expect(Point).type.not.toBeConstructableWith();
    expect(Point).type.toBeConstructableWith(); // fail: Expected 1-2 arguments, but got 0.

    expect(Test).type.not.toBeConstructableWith();
    expect(Test).type.toBeConstructableWith(); // fail: Expected 2 arguments, but got 0.
  });

  test("is not constructable with the given argument", () => {
    expect(Test).type.not.toBeConstructableWith("nope");
    expect(Test).type.toBeConstructableWith("nope"); // fail: Expected 2 arguments, but got 1.
  });

  test("is not constructable with the given arguments", () => {
    expect(Point).type.not.toBeConstructableWith(4, 5, 6);
    expect(Point).type.toBeConstructableWith(4, 5, 6); // fail: Expected 1-2 arguments, but got 3.
  });
});
