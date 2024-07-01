import { describe, expect, test } from "tstyche";

function first(a = "one") {
  return a;
}

function second(a: string, b = 123) {
  return a + b;
}

describe("when target is a value", () => {
  test("expression can be called without arguments", () => {
    expect(first).type.toBeCallableWith();
    expect(first).type.not.toBeCallableWith();
  });

  test("expression requires at least 1 argument", () => {
    expect(second).type.not.toBeCallableWith();
    expect(second).type.toBeCallableWith();
  });

  test("expression can be called with provided argument", () => {
    expect(first).type.toBeCallableWith(undefined);
    expect(first).type.not.toBeCallableWith(undefined);

    expect(first).type.toBeCallableWith("one");
    expect(first).type.not.toBeCallableWith("one");

    expect(second).type.toBeCallableWith("one");
    expect(second).type.not.toBeCallableWith("one");
  });

  test("expression can be called with provided arguments", () => {
    expect(second).type.toBeCallableWith("one", undefined);
    expect(second).type.not.toBeCallableWith("one", undefined);

    expect(second).type.toBeCallableWith("one", 123);
    expect(second).type.not.toBeCallableWith("one", 123);
  });

  test("expression takes at most 1 argument", () => {
    expect(first).type.not.toBeCallableWith("one", "two");
    expect(first).type.toBeCallableWith("one", "two");
  });

  test("expression takes at most 2 arguments", () => {
    expect(second).type.not.toBeCallableWith("one", 123, true);
    expect(second).type.toBeCallableWith("one", 123, true);
  });

  test("type expression can be called without arguments", () => {
    expect<(a?: string) => void>().type.toBeCallableWith();
    expect<(a?: string) => void>().type.not.toBeCallableWith();
  });

  test("type expression requires at least 1 argument", () => {
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith();
  });

  test("type expression can be called with provided argument", () => {
    expect<(a?: string) => void>().type.toBeCallableWith(undefined);
    expect<(a?: string) => void>().type.not.toBeCallableWith(undefined);

    expect<(a?: string) => void>().type.toBeCallableWith("one");
    expect<(a?: string) => void>().type.not.toBeCallableWith("one");

    expect<(a: string, b?: number) => void>().type.toBeCallableWith("one");
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith("one");
  });

  test("expression can be called with provided arguments", () => {
    expect<(a: string, b?: number) => void>().type.toBeCallableWith("one", undefined);
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith("one", undefined);

    expect<(a: string, b?: number) => void>().type.toBeCallableWith("one", 123);
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith("one", 123);
  });

  test("type expression takes at most 1 argument", () => {
    expect<(a?: string) => void>().type.not.toBeCallableWith("one", "two");
    expect<(a?: string) => void>().type.toBeCallableWith("one", "two");
  });

  test("expression takes at most 2 arguments", () => {
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith("one", 123, true);
    expect<(a: string, b?: number) => void>().type.toBeCallableWith("one", 123, true);
  });
});

describe("when target is a type", () => {
  test("expression can be called without arguments", () => {
    expect(first).type.toBeCallableWith<[]>();
    expect(first).type.not.toBeCallableWith<[]>();
  });

  test("expression requires at least 1 argument", () => {
    expect(second).type.not.toBeCallableWith<[]>();
    expect(second).type.toBeCallableWith<[]>();

    expect(second).type.not.toBeCallableWith<[a?: "one"]>();
    expect(second).type.toBeCallableWith<[a?: "one"]>();

    expect(second).type.not.toBeCallableWith<[a?: "one", b?: 123]>();
    expect(second).type.toBeCallableWith<[a?: "one", b?: 123]>();
  });

  test("expression can be called with provided argument", () => {
    expect(first).type.toBeCallableWith<[undefined]>();
    expect(first).type.not.toBeCallableWith<[undefined]>();

    expect(first).type.toBeCallableWith<["one"]>();
    expect(first).type.not.toBeCallableWith<["one"]>();

    expect(first).type.toBeCallableWith<[a: undefined]>();
    expect(first).type.not.toBeCallableWith<[a: undefined]>();

    expect(first).type.toBeCallableWith<[a?: "one"]>();
    expect(first).type.not.toBeCallableWith<[a?: "one"]>();

    expect(first).type.toBeCallableWith<[a: "one"]>();
    expect(first).type.not.toBeCallableWith<[a: "one"]>();

    expect(second).type.toBeCallableWith<["one"]>();
    expect(second).type.not.toBeCallableWith<["one"]>();

    expect(second).type.toBeCallableWith<[a: "one"]>();
    expect(second).type.not.toBeCallableWith<[a: "one"]>();
  });

  test("expression can be called with provided arguments", () => {
    expect(second).type.toBeCallableWith<["one", undefined]>();
    expect(second).type.not.toBeCallableWith<["one", undefined]>();

    expect(second).type.toBeCallableWith<["one", 123]>();
    expect(second).type.not.toBeCallableWith<["one", 123]>();

    expect(second).type.toBeCallableWith<[a: "one", b: undefined]>();
    expect(second).type.not.toBeCallableWith<[a: "one", b: undefined]>();

    expect(second).type.toBeCallableWith<[a: "one", b?: 123]>();
    expect(second).type.not.toBeCallableWith<[a: "one", b?: 123]>();

    expect(second).type.toBeCallableWith<[a: "one", b: 123]>();
    expect(second).type.not.toBeCallableWith<[a: "one", b: 123]>();
  });

  test("expression takes at most 1 argument", () => {
    expect(first).type.not.toBeCallableWith<["one", undefined]>();
    expect(first).type.toBeCallableWith<["one", undefined]>();

    expect(first).type.not.toBeCallableWith<["one", "two"]>();
    expect(first).type.toBeCallableWith<["one", "two"]>();

    expect(first).type.not.toBeCallableWith<[a: "one", b: "two"]>();
    expect(first).type.toBeCallableWith<[a: "one", b: "two"]>();

    expect(first).type.not.toBeCallableWith<[a: "one", b: undefined]>();
    expect(first).type.toBeCallableWith<[a: "one", b: undefined]>();

    expect(first).type.not.toBeCallableWith<[a: "one", b?: "two"]>();
    expect(first).type.toBeCallableWith<[a: "one", b?: "two"]>();
  });

  test("expression takes at most 2 arguments", () => {
    expect(second).type.not.toBeCallableWith<["one", 123, true]>();
    expect(second).type.toBeCallableWith<["one", 123, true]>();

    expect(second).type.not.toBeCallableWith<[a: "one", b: 123, c: true]>();
    expect(second).type.toBeCallableWith<[a: "one", b: 123, c: true]>();

    expect(second).type.not.toBeCallableWith<[a: "one", b: 123, c: undefined]>();
    expect(second).type.toBeCallableWith<[a: "one", b: 123, c: undefined]>();

    expect(second).type.not.toBeCallableWith<[a: "one", b: 123, c?: true]>();
    expect(second).type.toBeCallableWith<[a: "one", b: 123, c?: true]>();

    expect(second).type.not.toBeCallableWith<[a: "one", b: undefined, c: undefined]>();
    expect(second).type.toBeCallableWith<[a: "one", b: undefined, c: undefined]>();

    expect(second).type.not.toBeCallableWith<[a: "one", b?: 123, c?: true]>();
    expect(second).type.toBeCallableWith<[a: "one", b?: 123, c?: true]>();

    expect(second).type.not.toBeCallableWith<[a: undefined, b: undefined, c: undefined]>();
    expect(second).type.toBeCallableWith<[a: undefined, b: undefined, c: undefined]>();

    expect(second).type.not.toBeCallableWith<[a?: "one", b?: 123, c?: true]>();
    expect(second).type.toBeCallableWith<[a?: "one", b?: 123, c?: true]>();
  });

  test("type expression can be called without arguments", () => {
    expect<(a?: string) => void>().type.toBeCallableWith<[]>();
    expect<(a?: string) => void>().type.not.toBeCallableWith<[]>();
  });

  test("type expression requires at least 1 argument", () => {
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a?: "one"]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a?: "one"]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a?: "one", b?: 123]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a?: "one", b?: 123]>();
  });

  test("type expression can be called with provided argument", () => {
    expect<(a?: string) => void>().type.toBeCallableWith<[undefined]>();
    expect<(a?: string) => void>().type.not.toBeCallableWith<[undefined]>();

    expect<(a?: string) => void>().type.toBeCallableWith<["one"]>();
    expect<(a?: string) => void>().type.not.toBeCallableWith<["one"]>();

    expect<(a?: string) => void>().type.toBeCallableWith<[a: undefined]>();
    expect<(a?: string) => void>().type.not.toBeCallableWith<[a: undefined]>();

    expect<(a?: string) => void>().type.toBeCallableWith<[a?: "one"]>();
    expect<(a?: string) => void>().type.not.toBeCallableWith<[a?: "one"]>();

    expect<(a?: string) => void>().type.toBeCallableWith<[a: "one"]>();
    expect<(a?: string) => void>().type.not.toBeCallableWith<[a: "one"]>();

    expect<(a: string, b?: number) => void>().type.toBeCallableWith<["one"]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<["one"]>();

    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one"]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one"]>();
  });

  test("type expression can be called with provided arguments", () => {
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<["one", undefined]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<["one", undefined]>();

    expect<(a: string, b?: number) => void>().type.toBeCallableWith<["one", 123]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<["one", 123]>();

    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b: undefined]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b: undefined]>();

    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b?: 123]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b?: 123]>();

    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b: 123]>();
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b: 123]>();
  });

  test("type expression takes at most 1 argument", () => {
    expect<(a?: string) => void>().type.not.toBeCallableWith<["one", undefined]>();
    expect<(a?: string) => void>().type.toBeCallableWith<["one", undefined]>();

    expect<(a?: string) => void>().type.not.toBeCallableWith<["one", "two"]>();
    expect<(a?: string) => void>().type.toBeCallableWith<["one", "two"]>();

    expect<(a?: string) => void>().type.not.toBeCallableWith<[a: "one", b: "two"]>();
    expect<(a?: string) => void>().type.toBeCallableWith<[a: "one", b: "two"]>();

    expect<(a?: string) => void>().type.not.toBeCallableWith<[a: "one", b: undefined]>();
    expect<(a?: string) => void>().type.toBeCallableWith<[a: "one", b: undefined]>();

    expect<(a?: string) => void>().type.not.toBeCallableWith<[a: "one", b?: "two"]>();
    expect<(a?: string) => void>().type.toBeCallableWith<[a: "one", b?: "two"]>();
  });

  test("type expression takes at most 2 arguments", () => {
    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<["one", 123, true]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<["one", 123, true]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b: 123, c: true]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b: 123, c: true]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b: 123, c: undefined]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b: 123, c: undefined]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b: 123, c?: true]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b: 123, c?: true]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b: undefined, c: undefined]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b: undefined, c: undefined]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: "one", b?: 123, c?: true]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: "one", b?: 123, c?: true]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a: undefined, b: undefined, c: undefined]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a: undefined, b: undefined, c: undefined]>();

    expect<(a: string, b?: number) => void>().type.not.toBeCallableWith<[a?: "one", b?: 123, c?: true]>();
    expect<(a: string, b?: number) => void>().type.toBeCallableWith<[a?: "one", b?: 123, c?: true]>();
  });
});
