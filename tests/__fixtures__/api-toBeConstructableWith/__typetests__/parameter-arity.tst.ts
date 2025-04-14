import { describe, expect, test } from "tstyche";

class Zero {}

class One {
  a: string;
  constructor(a: string) {
    this.a = a;
  }
}

class OptionalFirst {
  a: string | undefined;
  constructor(a?: string) {
    this.a = a;
  }
}

class OptionalSecond {
  a: string;
  b: number | undefined;
  constructor(a: string, b?: number) {
    this.a = a;
    this.b = b;
  }
}

class DefaultFirst {
  a: string;
  constructor(a = "one") {
    this.a = a;
  }
}

class DefaultSecond {
  a: string;
  b: number;
  constructor(a: string, b = 123) {
    this.a = a;
    this.b = b;
  }
}

describe("when target is an expression", () => {
  test("can be called without arguments", () => {
    expect(Zero).type.toBeConstructableWith();
    expect(Zero).type.not.toBeConstructableWith(); // fail

    expect(OptionalFirst).type.toBeConstructableWith();
    expect(OptionalFirst).type.not.toBeConstructableWith(); // fail

    expect(DefaultFirst).type.toBeConstructableWith();
    expect(DefaultFirst).type.not.toBeConstructableWith(); // fail
  });

  test("cannot be called without arguments", () => {
    expect(One).type.not.toBeConstructableWith();
    expect(One).type.toBeConstructableWith(); // fail: Expected 1 arguments, but got 0.

    expect(OptionalSecond).type.not.toBeConstructableWith();
    expect(OptionalSecond).type.toBeConstructableWith(); // fail: Expected 1-2 arguments, but got 0.

    expect(DefaultSecond).type.not.toBeConstructableWith();
    expect(DefaultSecond).type.toBeConstructableWith(); // fail: Expected 1-2 arguments, but got 0.
  });

  test("can be called with the given argument", () => {
    expect(One).type.toBeConstructableWith("one");
    expect(One).type.not.toBeConstructableWith("one"); // fail

    expect(OptionalFirst).type.toBeConstructableWith(undefined);
    expect(OptionalFirst).type.not.toBeConstructableWith(undefined); // fail

    expect(OptionalFirst).type.toBeConstructableWith("one");
    expect(OptionalFirst).type.not.toBeConstructableWith("one"); // fail

    expect(OptionalSecond).type.toBeConstructableWith("one");
    expect(OptionalSecond).type.not.toBeConstructableWith("one"); // fail

    expect(DefaultFirst).type.toBeConstructableWith(undefined);
    expect(DefaultFirst).type.not.toBeConstructableWith(undefined); // fail

    expect(DefaultFirst).type.toBeConstructableWith("one");
    expect(DefaultFirst).type.not.toBeConstructableWith("one"); // fail

    expect(DefaultSecond).type.toBeConstructableWith("one");
    expect(DefaultSecond).type.not.toBeConstructableWith("one"); // fail
  });

  test("cannot be called with the given argument", () => {
    expect(Zero).type.not.toBeConstructableWith("one");
    expect(Zero).type.toBeConstructableWith("one"); // fail: Expected 0 arguments, but got 1.
  });

  test("can be called with the given arguments", () => {
    expect(OptionalSecond).type.toBeConstructableWith("one", undefined);
    expect(OptionalSecond).type.not.toBeConstructableWith("one", undefined); // fail

    expect(OptionalSecond).type.toBeConstructableWith(...["one", undefined]);
    expect(OptionalSecond).type.not.toBeConstructableWith(...["one", undefined]); // fail

    expect(OptionalSecond).type.toBeConstructableWith("one", 123);
    expect(OptionalSecond).type.not.toBeConstructableWith("one", 123); // fail

    expect(OptionalSecond).type.toBeConstructableWith(...["one", 123]);
    expect(OptionalSecond).type.not.toBeConstructableWith(...["one", 123]); // fail

    expect(DefaultSecond).type.toBeConstructableWith("one", undefined);
    expect(DefaultSecond).type.not.toBeConstructableWith("one", undefined); // fail

    expect(DefaultSecond).type.toBeConstructableWith(...["one", undefined]);
    expect(DefaultSecond).type.not.toBeConstructableWith(...["one", undefined]); // fail

    expect(DefaultSecond).type.toBeConstructableWith("one", 123);
    expect(DefaultSecond).type.not.toBeConstructableWith("one", 123); // fail

    expect(DefaultSecond).type.toBeConstructableWith(...["one", 123]);
    expect(DefaultSecond).type.not.toBeConstructableWith(...["one", 123]); // fail
  });

  test("cannot be called with the given arguments", () => {
    expect(One).type.not.toBeConstructableWith("one", "two");
    expect(One).type.toBeConstructableWith("one", "two"); // fail: Expected 1 arguments, but got 2.

    expect(One).type.not.toBeConstructableWith(...["one", "two"]);
    expect(One).type.toBeConstructableWith(...["one", "two"]); // fail: Expected 1 arguments, but got 2.

    expect(OptionalFirst).type.not.toBeConstructableWith("one", "two");
    expect(OptionalFirst).type.toBeConstructableWith("one", "two"); // fail: Expected 0-1 arguments, but got 2.

    expect(OptionalFirst).type.not.toBeConstructableWith(...["one", "two"]);
    expect(OptionalFirst).type.toBeConstructableWith(...["one", "two"]); // fail: Expected 0-1 arguments, but got 2.

    expect(OptionalSecond).type.not.toBeConstructableWith("one", 123, true);
    expect(OptionalSecond).type.toBeConstructableWith("one", 123, true); // fail: Expected 1-2 arguments, but got 3.

    expect(OptionalSecond).type.not.toBeConstructableWith(...["one", 123, true]);
    expect(OptionalSecond).type.toBeConstructableWith(...["one", 123, true]); // fail: Expected 1-2 arguments, but got 3.

    expect(DefaultFirst).type.not.toBeConstructableWith("one", "two");
    expect(DefaultFirst).type.toBeConstructableWith("one", "two"); // fail: Expected 0-1 arguments, but got 2.

    expect(DefaultFirst).type.not.toBeConstructableWith(...["one", "two"]);
    expect(DefaultFirst).type.toBeConstructableWith(...["one", "two"]); // fail: Expected 0-1 arguments, but got 2.

    expect(DefaultSecond).type.not.toBeConstructableWith("one", 123, true);
    expect(DefaultSecond).type.toBeConstructableWith("one", 123, true); // fail: Expected 1-2 arguments, but got 3.

    expect(DefaultSecond).type.not.toBeConstructableWith(...["one", 123, true]);
    expect(DefaultSecond).type.toBeConstructableWith(...["one", 123, true]); // fail: Expected 1-2 arguments, but got 3.
  });
});
