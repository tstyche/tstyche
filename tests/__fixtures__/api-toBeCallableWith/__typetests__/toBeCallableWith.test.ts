import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'toBeCallableWith' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeCallableWith", jest.expect.any(Function));
});

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

  test("expression requires an argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith();
    expect((a: string) => a).type.toBeCallableWith();
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

  test("type expression requires an argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith();
    expect<(a: string) => string>().type.toBeCallableWith();
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

  test("expression requires an argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith<[]>();
    expect((a: string) => a).type.toBeCallableWith<[]>();
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

  test("type expression requires an argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith<[]>();
    expect<(a: string) => string>().type.toBeCallableWith<[]>();
  });
});
