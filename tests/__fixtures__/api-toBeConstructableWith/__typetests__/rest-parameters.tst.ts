import { describe, expect, test } from "tstyche";

class Optional {
  a: Array<unknown>;
  constructor(...args: Array<unknown>) {
    this.a = args;
  }
}

class Leading {
  a: Array<unknown>;
  constructor(...args: [...Array<string>, boolean]) {
    this.a = args;
  }
}

class Middle {
  a: Array<unknown>;
  constructor(...args: [string, ...Array<number>, boolean]) {
    this.a = args;
  }
}

class Trailing {
  x: boolean;
  y: Array<string>;
  constructor(x: boolean, ...y: Array<string>) {
    this.x = x;
    this.y = y;
  }
}

describe("when target is an expression", () => {
  test("can be called with the given argument", () => {
    expect(Optional).type.toBeConstructableWith("one");
    expect(Optional).type.not.toBeConstructableWith("one"); // fail

    expect(Leading).type.toBeConstructableWith(false);
    expect(Leading).type.not.toBeConstructableWith(false); // fail

    expect(Trailing).type.toBeConstructableWith(true);
    expect(Trailing).type.not.toBeConstructableWith(true); // fail
  });

  test("can be called with the given arguments", () => {
    expect(Optional).type.toBeConstructableWith("one", 2, true);
    expect(Optional).type.not.toBeConstructableWith("one", 2, true); // fail

    expect(Leading).type.toBeConstructableWith("one", "two", true);
    expect(Leading).type.not.toBeConstructableWith("one", "two", true); // fail

    expect(Leading).type.toBeConstructableWith(...["one", "two"], true);
    expect(Leading).type.not.toBeConstructableWith(...["one", "two"], true); // fail

    expect(Middle).type.toBeConstructableWith("one", 123, 456, true);
    expect(Middle).type.not.toBeConstructableWith("one", 123, 456, true); // fail

    expect(Middle).type.toBeConstructableWith(...["one", 123, 456, true]);
    expect(Middle).type.not.toBeConstructableWith(...["one", 123, 456, true]); // fail

    expect(Trailing).type.toBeConstructableWith(false, "ten", "eleven");
    expect(Trailing).type.not.toBeConstructableWith(false, "ten", "eleven"); // fail

    expect(Trailing).type.toBeConstructableWith(false, ...["ten", "eleven"]);
    expect(Trailing).type.not.toBeConstructableWith(false, ...["ten", "eleven"]); // fail
  });

  test("can be called without arguments", () => {
    expect(Optional).type.toBeConstructableWith();
    expect(Optional).type.not.toBeConstructableWith(); // fail
  });

  test("cannot be called without arguments", () => {
    expect(Leading).type.not.toBeConstructableWith();
    expect(Leading).type.toBeConstructableWith(); // fail: Source has 0 element(s) but target requires 1.

    expect(Middle).type.not.toBeConstructableWith();
    expect(Middle).type.toBeConstructableWith(); // fail: Expected at least 1 arguments, but got 0.

    expect(Trailing).type.not.toBeConstructableWith();
    expect(Trailing).type.toBeConstructableWith(); // fail: Expected at least 1 arguments, but got 0.
  });

  test("cannot be called with the given arguments", () => {
    expect(Leading).type.not.toBeConstructableWith("one", "two");
    expect(Leading).type.toBeConstructableWith("one", "two"); // fail

    expect(Leading).type.not.toBeConstructableWith(...["one", "two"]);
    expect(Leading).type.toBeConstructableWith(...["one", "two"]); // fail

    expect(Leading).type.not.toBeConstructableWith(3, 4, true);
    expect(Leading).type.toBeConstructableWith(3, 4, true); // fail

    expect(Leading).type.not.toBeConstructableWith(...[3, 4], true);
    expect(Leading).type.toBeConstructableWith(...[3, 4], true); // fail

    expect(Middle).type.not.toBeConstructableWith("one", 2, 3);
    expect(Middle).type.toBeConstructableWith("one", 2, 3); // fail

    expect(Middle).type.not.toBeConstructableWith(...["one", 2, 3]);
    expect(Middle).type.toBeConstructableWith(...["one", 2, 3]); // fail

    expect(Middle).type.not.toBeConstructableWith("one", "two", "three", true);
    expect(Middle).type.toBeConstructableWith("one", "two", "three", true); // fail

    expect(Middle).type.not.toBeConstructableWith(...["one", "two", "three", true]);
    expect(Middle).type.toBeConstructableWith(...["one", "two", "three", true]); // fail

    expect(Trailing).type.not.toBeConstructableWith("ten", "eleven");
    expect(Trailing).type.toBeConstructableWith("ten", "eleven"); // fail

    expect(Trailing).type.not.toBeConstructableWith(...["ten", "eleven"]);
    expect(Trailing).type.toBeConstructableWith(...["ten", "eleven"]); // fail

    expect(Trailing).type.not.toBeConstructableWith(false, 10, 11);
    expect(Trailing).type.toBeConstructableWith(false, 10, 11); // fail

    expect(Trailing).type.not.toBeConstructableWith(false, ...[10, 11]);
    expect(Trailing).type.toBeConstructableWith(false, ...[10, 11]); // fail
  });
});
