import { describe, expect, test } from "tstyche";

const noArguments = () => null;
const oneArgument = (a: string) => a;

declare function optionalFirst(a?: string): void;
declare function optionalSecond(a: string, b?: number): void;

function defaultFirst(a = "one") {
  return a;
}

function defaultSecond(a: string, b = 123) {
  return a + b;
}

describe("when source is an expression", () => {
  test("is callable without arguments", () => {
    expect(noArguments).type.toBeCallableWith();
    expect(noArguments).type.not.toBeCallableWith(); // fail

    expect(optionalFirst).type.toBeCallableWith();
    expect(optionalFirst).type.not.toBeCallableWith(); // fail

    expect(defaultFirst).type.toBeCallableWith();
    expect(defaultFirst).type.not.toBeCallableWith(); // fail
  });

  test("is not callable without arguments", () => {
    expect(oneArgument).type.not.toBeCallableWith();
    expect(oneArgument).type.toBeCallableWith(); // fail: Expected 1 arguments, but got 0.

    expect(optionalSecond).type.not.toBeCallableWith();
    expect(optionalSecond).type.toBeCallableWith(); // fail: Expected 1-2 arguments, but got 0.

    expect(defaultSecond).type.not.toBeCallableWith();
    expect(defaultSecond).type.toBeCallableWith(); // fail: Expected 1-2 arguments, but got 0.
  });

  test("is callable with the given argument", () => {
    expect(oneArgument).type.toBeCallableWith("one");
    expect(oneArgument).type.not.toBeCallableWith("one"); // fail

    expect(optionalFirst).type.toBeCallableWith(undefined);
    expect(optionalFirst).type.not.toBeCallableWith(undefined); // fail

    expect(optionalFirst).type.toBeCallableWith("one");
    expect(optionalFirst).type.not.toBeCallableWith("one"); // fail

    expect(optionalSecond).type.toBeCallableWith("one");
    expect(optionalSecond).type.not.toBeCallableWith("one"); // fail

    expect(defaultFirst).type.toBeCallableWith(undefined);
    expect(defaultFirst).type.not.toBeCallableWith(undefined); // fail

    expect(defaultFirst).type.toBeCallableWith("one");
    expect(defaultFirst).type.not.toBeCallableWith("one"); // fail

    expect(defaultSecond).type.toBeCallableWith("one");
    expect(defaultSecond).type.not.toBeCallableWith("one"); // fail
  });

  test("is not callable with the given argument", () => {
    expect(noArguments).type.not.toBeCallableWith("one");
    expect(noArguments).type.toBeCallableWith("one"); // fail: Expected 0 arguments, but got 1.
  });

  test("is callable with the given arguments", () => {
    expect(optionalSecond).type.toBeCallableWith("one", undefined);
    expect(optionalSecond).type.not.toBeCallableWith("one", undefined); // fail

    expect(optionalSecond).type.toBeCallableWith(...["one", undefined]);
    expect(optionalSecond).type.not.toBeCallableWith(...["one", undefined]); // fail

    expect(optionalSecond).type.toBeCallableWith("one", 123);
    expect(optionalSecond).type.not.toBeCallableWith("one", 123); // fail

    expect(optionalSecond).type.toBeCallableWith(...["one", 123]);
    expect(optionalSecond).type.not.toBeCallableWith(...["one", 123]); // fail

    expect(defaultSecond).type.toBeCallableWith("one", undefined);
    expect(defaultSecond).type.not.toBeCallableWith("one", undefined); // fail

    expect(defaultSecond).type.toBeCallableWith(...["one", undefined]);
    expect(defaultSecond).type.not.toBeCallableWith(...["one", undefined]); // fail

    expect(defaultSecond).type.toBeCallableWith("one", 123);
    expect(defaultSecond).type.not.toBeCallableWith("one", 123); // fail

    expect(defaultSecond).type.toBeCallableWith(...["one", 123]);
    expect(defaultSecond).type.not.toBeCallableWith(...["one", 123]); // fail
  });

  test("is not callable with the given arguments", () => {
    expect(oneArgument).type.not.toBeCallableWith("one", "two");
    expect(oneArgument).type.toBeCallableWith("one", "two"); // fail: Expected 1 arguments, but got 2.

    expect(oneArgument).type.not.toBeCallableWith(...["one", "two"]);
    expect(oneArgument).type.toBeCallableWith(...["one", "two"]); // fail: Expected 1 arguments, but got 2.

    expect(optionalFirst).type.not.toBeCallableWith("one", "two");
    expect(optionalFirst).type.toBeCallableWith("one", "two"); // fail: Expected 0-1 arguments, but got 2.

    expect(optionalFirst).type.not.toBeCallableWith(...["one", "two"]);
    expect(optionalFirst).type.toBeCallableWith(...["one", "two"]); // fail: Expected 0-1 arguments, but got 2.

    expect(optionalSecond).type.not.toBeCallableWith("one", 123, true);
    expect(optionalSecond).type.toBeCallableWith("one", 123, true); // fail: Expected 1-2 arguments, but got 3.

    expect(optionalSecond).type.not.toBeCallableWith(...["one", 123, true]);
    expect(optionalSecond).type.toBeCallableWith(...["one", 123, true]); // fail: Expected 1-2 arguments, but got 3.

    expect(defaultFirst).type.not.toBeCallableWith("one", "two");
    expect(defaultFirst).type.toBeCallableWith("one", "two"); // fail: Expected 0-1 arguments, but got 2.

    expect(defaultFirst).type.not.toBeCallableWith(...["one", "two"]);
    expect(defaultFirst).type.toBeCallableWith(...["one", "two"]); // fail: Expected 0-1 arguments, but got 2.

    expect(defaultSecond).type.not.toBeCallableWith("one", 123, true);
    expect(defaultSecond).type.toBeCallableWith("one", 123, true); // fail: Expected 1-2 arguments, but got 3.

    expect(defaultSecond).type.not.toBeCallableWith(...["one", 123, true]);
    expect(defaultSecond).type.toBeCallableWith(...["one", 123, true]); // fail: Expected 1-2 arguments, but got 3.
  });
});

type NoArguments = () => null;
type OneArgument = (a: string) => string;

type OptionalFirst = (a?: string) => void;
type OptionalSecond = (a: string, b?: number) => void;

describe("when source is a type", () => {
  test("is callable without arguments", () => {
    expect<NoArguments>().type.toBeCallableWith();
    expect<NoArguments>().type.not.toBeCallableWith(); // fail

    expect<OptionalFirst>().type.toBeCallableWith();
    expect<OptionalFirst>().type.not.toBeCallableWith(); // fail
  });

  test("is not callable without arguments", () => {
    expect<OneArgument>().type.not.toBeCallableWith();
    expect<OneArgument>().type.toBeCallableWith(); // fail: Expected 1 arguments, but got 0.

    expect<OptionalSecond>().type.not.toBeCallableWith();
    expect<OptionalSecond>().type.toBeCallableWith(); // fail: Expected 1-2 arguments, but got 0.
  });

  test("is callable with the given argument", () => {
    expect<OneArgument>().type.toBeCallableWith("one");
    expect<OneArgument>().type.not.toBeCallableWith("one"); // fail

    expect<OptionalFirst>().type.toBeCallableWith(undefined);
    expect<OptionalFirst>().type.not.toBeCallableWith(undefined); // fail

    expect<OptionalFirst>().type.toBeCallableWith("one");
    expect<OptionalFirst>().type.not.toBeCallableWith("one"); // fail

    expect<OptionalSecond>().type.toBeCallableWith("one");
    expect<OptionalSecond>().type.not.toBeCallableWith("one"); // fail
  });

  test("is not callable with the given argument", () => {
    expect<NoArguments>().type.not.toBeCallableWith("one");
    expect<NoArguments>().type.toBeCallableWith("one"); // fail: Expected 0 arguments, but got 1.
  });

  test("is callable with the given arguments", () => {
    expect<OptionalSecond>().type.toBeCallableWith("one", undefined);
    expect<OptionalSecond>().type.not.toBeCallableWith("one", undefined); // fail

    expect<OptionalSecond>().type.toBeCallableWith(...["one", undefined]);
    expect<OptionalSecond>().type.not.toBeCallableWith(...["one", undefined]); // fail

    expect<OptionalSecond>().type.toBeCallableWith("one", 123);
    expect<OptionalSecond>().type.not.toBeCallableWith("one", 123); // fail

    expect<OptionalSecond>().type.toBeCallableWith(...["one", 123]);
    expect<OptionalSecond>().type.not.toBeCallableWith(...["one", 123]); // fail
  });

  test("is not callable with the given arguments", () => {
    expect<OneArgument>().type.not.toBeCallableWith("one", "two");
    expect<OneArgument>().type.toBeCallableWith("one", "two"); // fail: Expected 1 arguments, but got 2.

    expect<OneArgument>().type.not.toBeCallableWith(...["one", "two"]);
    expect<OneArgument>().type.toBeCallableWith(...["one", "two"]); // fail: Expected 1 arguments, but got 2.

    expect<OptionalFirst>().type.not.toBeCallableWith("one", "two");
    expect<OptionalFirst>().type.toBeCallableWith("one", "two"); // fail: Expected 0-1 arguments, but got 2.

    expect<OptionalFirst>().type.not.toBeCallableWith(...["one", "two"]);
    expect<OptionalFirst>().type.toBeCallableWith(...["one", "two"]); // fail: Expected 0-1 arguments, but got 2.

    expect<OptionalSecond>().type.not.toBeCallableWith("one", 123, true);
    expect<OptionalSecond>().type.toBeCallableWith("one", 123, true); // fail: Expected 1-2 arguments, but got 3.

    expect<OptionalSecond>().type.not.toBeCallableWith(...["one", 123, true]);
    expect<OptionalSecond>().type.toBeCallableWith(...["one", 123, true]); // fail: Expected 1-2 arguments, but got 3.
  });
});
