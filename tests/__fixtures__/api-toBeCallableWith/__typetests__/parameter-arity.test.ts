import { describe, expect, test } from "tstyche";

describe("when target is a value", () => {
  test("expression can be called without arguments", () => {
    expect(() => null).type.toBeCallableWith();
    expect(() => null).type.not.toBeCallableWith();
  });

  test("expression does not take arguments", () => {
    expect(() => null).type.not.toBeCallableWith("one");
    expect(() => null).type.toBeCallableWith("one");
  });

  test("expression can be called with provided argument", () => {
    expect((a: string) => a).type.toBeCallableWith("one");
    expect((a: string) => a).type.not.toBeCallableWith("one");
  });

  test("expression requires 1 argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith();
    expect((a: string) => a).type.toBeCallableWith();
  });

  test("expression takes only 1 argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith("one", "two");
    expect((a: string) => a).type.toBeCallableWith("one", "two");
  });

  test("type expression can be called without arguments", () => {
    expect<() => null>().type.toBeCallableWith();
    expect<() => null>().type.not.toBeCallableWith();
  });

  test("type expression does not take arguments", () => {
    expect<() => null>().type.not.toBeCallableWith("one");
    expect<() => null>().type.toBeCallableWith("one");
  });

  test("type expression can be called with provided argument", () => {
    expect<(a: string) => string>().type.toBeCallableWith("one");
    expect<(a: string) => string>().type.not.toBeCallableWith("one");
  });

  test("type expression requires 1 argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith();
    expect<(a: string) => string>().type.toBeCallableWith();
  });

  test("type expression takes only 1 argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith("one", "two");
    expect<(a: string) => string>().type.toBeCallableWith("one", "two");
  });
});

describe("when target is a type", () => {
  test("expression can be called without arguments", () => {
    expect(() => null).type.toBeCallableWith<[]>();
    expect(() => null).type.not.toBeCallableWith<[]>();
  });

  test("expression does not take arguments", () => {
    expect(() => null).type.not.toBeCallableWith<["one"]>();
    expect(() => null).type.toBeCallableWith<["one"]>();
  });

  test("expression can be called with provided argument", () => {
    expect((a: string) => a).type.toBeCallableWith<["one"]>();
    expect((a: string) => a).type.not.toBeCallableWith<["one"]>();
  });

  test("expression requires 1 argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith<[]>();
    expect((a: string) => a).type.toBeCallableWith<[]>();
  });

  test("expression takes only 1 argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith<["one", "two"]>();
    expect((a: string) => a).type.toBeCallableWith<["one", "two"]>();
  });

  test("type expression can be called without arguments", () => {
    expect<() => null>().type.toBeCallableWith<[]>();
    expect<() => null>().type.not.toBeCallableWith<[]>();
  });

  test("type expression does not take arguments", () => {
    expect<() => null>().type.not.toBeCallableWith<["one"]>();
    expect<() => null>().type.toBeCallableWith<["one"]>();
  });

  test("type expression can be called with provided argument", () => {
    expect<(a: string) => string>().type.toBeCallableWith<["one"]>();
    expect<(a: string) => string>().type.not.toBeCallableWith<["one"]>();
  });

  test("type expression requires 1 argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith<[]>();
    expect<(a: string) => string>().type.toBeCallableWith<[]>();
  });

  test("type expression takes only 1 argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith<["one", "two"]>();
    expect<(a: string) => string>().type.toBeCallableWith<["one", "two"]>();
  });
});
