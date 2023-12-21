import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'toBeCallable' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toBeCallable", jest.expect.any(Function));
});

describe("when target is a value", () => {
  test("expression can be called without arguments", () => {
    expect(() => null).type.toBeCallableWith();
    expect(() => null).type.not.toBeCallableWith();
  });

  test("expression requires an argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith();
    expect((a: string) => a).type.toBeCallableWith();
  });

  test("type expression can be called without arguments", () => {
    expect<() => null>().type.toBeCallableWith();
    expect<() => null>().type.not.toBeCallableWith();
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

  test("expression requires an argument", () => {
    expect((a: string) => a).type.not.toBeCallableWith<[]>();
    expect((a: string) => a).type.toBeCallableWith<[]>();
  });

  test("type expression can be called without arguments", () => {
    expect<() => null>().type.toBeCallableWith<[]>();
    expect<() => null>().type.not.toBeCallableWith<[]>();
  });

  test("type expression requires an argument", () => {
    expect<(a: string) => string>().type.not.toBeCallableWith<[]>();
    expect<(a: string) => string>().type.toBeCallableWith<[]>();
  });
});
