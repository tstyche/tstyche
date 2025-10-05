import { describe, expect, test } from "tstyche";

declare function optional(...args: Array<unknown>): void;

declare function leading(...args: [...Array<string>, boolean]): void;
declare function middle(...args: [string, ...Array<number>, boolean]): void;
declare function trailing(x: boolean, ...y: Array<string>): void;

describe("when source is an expression", () => {
  test("is callable with the given argument", () => {
    expect(optional).type.toBeCallableWith("one");
    expect(optional).type.not.toBeCallableWith("one"); // fail

    expect(leading).type.toBeCallableWith(false);
    expect(leading).type.not.toBeCallableWith(false); // fail

    expect(trailing).type.toBeCallableWith(true);
    expect(trailing).type.not.toBeCallableWith(true); // fail
  });

  test("is callable with the given arguments", () => {
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

  test("is callable without arguments", () => {
    expect(optional).type.toBeCallableWith();
    expect(optional).type.not.toBeCallableWith(); // fail
  });

  test("is not callable without arguments", () => {
    expect(leading).type.not.toBeCallableWith();
    expect(leading).type.toBeCallableWith(); // fail: Source has 0 element(s) but target requires 1.

    expect(middle).type.not.toBeCallableWith();
    expect(middle).type.toBeCallableWith(); // fail: Expected at least 1 arguments, but got 0.

    expect(trailing).type.not.toBeCallableWith();
    expect(trailing).type.toBeCallableWith(); // fail: Expected at least 1 arguments, but got 0.
  });

  test("is not callable with the given arguments", () => {
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

type Optional = (...args: Array<unknown>) => void;

type Leading = (...args: [...Array<string>, boolean]) => void;
type Middle = (...args: [string, ...Array<number>, boolean]) => void;
type Trailing = (x: boolean, ...y: Array<string>) => void;

describe("when source is a type", () => {
  test("is callable with the given argument", () => {
    expect<Optional>().type.toBeCallableWith("one");
    expect<Optional>().type.not.toBeCallableWith("one"); // fail

    expect<Leading>().type.toBeCallableWith(false);
    expect<Leading>().type.not.toBeCallableWith(false); // fail

    expect<Trailing>().type.toBeCallableWith(true);
    expect<Trailing>().type.not.toBeCallableWith(true); // fail
  });

  test("is callable with the given arguments", () => {
    expect<Optional>().type.toBeCallableWith("one", 2, true);
    expect<Optional>().type.not.toBeCallableWith("one", 2, true); // fail

    expect<Leading>().type.toBeCallableWith("one", "two", true);
    expect<Leading>().type.not.toBeCallableWith("one", "two", true); // fail

    expect<Leading>().type.toBeCallableWith(...["one", "two"], true);
    expect<Leading>().type.not.toBeCallableWith(...["one", "two"], true); // fail

    expect<Middle>().type.toBeCallableWith("one", 123, 456, true);
    expect<Middle>().type.not.toBeCallableWith("one", 123, 456, true); // fail

    expect<Middle>().type.toBeCallableWith(...["one", 123, 456, true]);
    expect<Middle>().type.not.toBeCallableWith(...["one", 123, 456, true]); // fail

    expect<Trailing>().type.toBeCallableWith(false, "ten", "eleven");
    expect<Trailing>().type.not.toBeCallableWith(false, "ten", "eleven"); // fail

    expect<Trailing>().type.toBeCallableWith(false, ...["ten", "eleven"]);
    expect<Trailing>().type.not.toBeCallableWith(false, ...["ten", "eleven"]); // fail
  });

  test("is callable without arguments", () => {
    expect<Optional>().type.toBeCallableWith();
    expect<Optional>().type.not.toBeCallableWith(); // fail
  });

  test("is not callable without arguments", () => {
    expect<Leading>().type.not.toBeCallableWith();
    expect<Leading>().type.toBeCallableWith(); // fail: Source has 0 element(s) but target requires 1.

    expect<Middle>().type.not.toBeCallableWith();
    expect<Middle>().type.toBeCallableWith(); // fail: Expected at least 1 arguments, but got 0.

    expect<Trailing>().type.not.toBeCallableWith();
    expect<Trailing>().type.toBeCallableWith(); // fail: Expected at least 1 arguments, but got 0.
  });

  test("is not callable with the given arguments", () => {
    expect<Leading>().type.not.toBeCallableWith("one", "two");
    expect<Leading>().type.toBeCallableWith("one", "two"); // fail

    expect<Leading>().type.not.toBeCallableWith(...["one", "two"]);
    expect<Leading>().type.toBeCallableWith(...["one", "two"]); // fail

    expect<Leading>().type.not.toBeCallableWith(3, 4, true);
    expect<Leading>().type.toBeCallableWith(3, 4, true); // fail

    expect<Leading>().type.not.toBeCallableWith(...[3, 4], true);
    expect<Leading>().type.toBeCallableWith(...[3, 4], true); // fail

    expect<Middle>().type.not.toBeCallableWith("one", 2, 3);
    expect<Middle>().type.toBeCallableWith("one", 2, 3); // fail

    expect<Middle>().type.not.toBeCallableWith(...["one", 2, 3]);
    expect<Middle>().type.toBeCallableWith(...["one", 2, 3]); // fail

    expect<Middle>().type.not.toBeCallableWith("one", "two", "three", true);
    expect<Middle>().type.toBeCallableWith("one", "two", "three", true); // fail

    expect<Middle>().type.not.toBeCallableWith(...["one", "two", "three", true]);
    expect<Middle>().type.toBeCallableWith(...["one", "two", "three", true]); // fail

    expect<Trailing>().type.not.toBeCallableWith("ten", "eleven");
    expect<Trailing>().type.toBeCallableWith("ten", "eleven"); // fail

    expect<Trailing>().type.not.toBeCallableWith(...["ten", "eleven"]);
    expect<Trailing>().type.toBeCallableWith(...["ten", "eleven"]); // fail

    expect<Trailing>().type.not.toBeCallableWith(false, 10, 11);
    expect<Trailing>().type.toBeCallableWith(false, 10, 11); // fail

    expect<Trailing>().type.not.toBeCallableWith(false, ...[10, 11]);
    expect<Trailing>().type.toBeCallableWith(false, ...[10, 11]); // fail
  });
});
