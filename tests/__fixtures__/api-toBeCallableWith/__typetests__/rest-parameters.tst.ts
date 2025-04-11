import { describe, expect, test } from "tstyche";

declare function optional(...args: Array<unknown>): void;

declare function leading(...args: [...Array<string>, boolean]): void;
declare function middle(...args: [string, ...Array<number>, boolean]): void;
declare function trailing(x: boolean, ...y: Array<string>): void;

describe("when target is an expression", () => {
  test("can be called with the given argument", () => {
    expect(optional).type.toBeCallableWith("one");
    expect(optional).type.not.toBeCallableWith("one"); // fail

    expect(leading).type.toBeCallableWith(false);
    expect(leading).type.not.toBeCallableWith(false); // fail

    expect(trailing).type.toBeCallableWith(true);
    expect(trailing).type.not.toBeCallableWith(true); // fail
  });

  test("can be called with the given arguments", () => {
    expect(optional).type.toBeCallableWith("one", 2, true);
    expect(optional).type.not.toBeCallableWith("one", 2, true); // fail

    expect(leading).type.toBeCallableWith("one", "two", true);
    expect(leading).type.not.toBeCallableWith("one", "two", true); // fail

    expect(leading).type.toBeCallableWith(...["one", "two"], true);
    expect(leading).type.not.toBeCallableWith(...["one", "two"], true); // fail

    expect(middle).type.toBeCallableWith("one", 123, 456, true);
    expect(middle).type.not.toBeCallableWith("one", 123, 456, true); // fail

    expect(middle).type.toBeCallableWith(...["one", 123, 456, true]);
    expect(middle).type.not.toBeCallableWith(...["one", 123, 456, true]); // fail

    expect(trailing).type.toBeCallableWith(false, "ten", "eleven");
    expect(trailing).type.not.toBeCallableWith(false, "ten", "eleven"); // fail

    expect(trailing).type.toBeCallableWith(false, ...["ten", "eleven"]);
    expect(trailing).type.not.toBeCallableWith(false, ...["ten", "eleven"]); // fail
  });

  test("can be called without arguments", () => {
    expect(optional).type.toBeCallableWith();
    expect(optional).type.not.toBeCallableWith(); // fail
  });

  test("cannot be called without arguments", () => {
    expect(leading).type.not.toBeCallableWith();
    expect(leading).type.toBeCallableWith(); // fail: Source has 0 element(s) but target requires 1.

    expect(middle).type.not.toBeCallableWith();
    expect(middle).type.toBeCallableWith(); // fail: Expected at least 1 arguments, but got 0.

    expect(trailing).type.not.toBeCallableWith();
    expect(trailing).type.toBeCallableWith(); // fail: Expected at least 1 arguments, but got 0.
  });

  test("cannot be called with the given arguments", () => {
    expect(leading).type.not.toBeCallableWith("one", "two");
    expect(leading).type.toBeCallableWith("one", "two"); // fail

    expect(leading).type.not.toBeCallableWith(...["one", "two"]);
    expect(leading).type.toBeCallableWith(...["one", "two"]); // fail

    expect(leading).type.not.toBeCallableWith(3, 4, true);
    expect(leading).type.toBeCallableWith(3, 4, true); // fail

    expect(leading).type.not.toBeCallableWith(...[3, 4], true);
    expect(leading).type.toBeCallableWith(...[3, 4], true); // fail

    expect(middle).type.not.toBeCallableWith("one", 2, 3);
    expect(middle).type.toBeCallableWith("one", 2, 3); // fail

    expect(middle).type.not.toBeCallableWith(...["one", 2, 3]);
    expect(middle).type.toBeCallableWith(...["one", 2, 3]); // fail

    expect(middle).type.not.toBeCallableWith("one", "two", "three", true);
    expect(middle).type.toBeCallableWith("one", "two", "three", true); // fail

    expect(middle).type.not.toBeCallableWith(...["one", "two", "three", true]);
    expect(middle).type.toBeCallableWith(...["one", "two", "three", true]); // fail

    expect(trailing).type.not.toBeCallableWith("ten", "eleven");
    expect(trailing).type.toBeCallableWith("ten", "eleven"); // fail

    expect(trailing).type.not.toBeCallableWith(...["ten", "eleven"]);
    expect(trailing).type.toBeCallableWith(...["ten", "eleven"]); // fail

    expect(trailing).type.not.toBeCallableWith(false, 10, 11);
    expect(trailing).type.toBeCallableWith(false, 10, 11); // fail

    expect(trailing).type.not.toBeCallableWith(false, ...[10, 11]);
    expect(trailing).type.toBeCallableWith(false, ...[10, 11]); // fail
  });
});
