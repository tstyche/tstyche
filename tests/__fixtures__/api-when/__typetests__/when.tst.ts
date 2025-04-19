import { describe, expect, test, when } from "tstyche";

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void;
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>;

describe("when target is an expression", () => {
  test("is called with?", () => {
    when(pipe).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("valid"));
    when(pipe).isCalledWith({ valid: true }, expect(pick).type.not.toBeCallableWith("valid")); // fail

    when(pipe).isCalledWith({ valid: true }, expect(pick).type.not.toBeCallableWith("required"));
    when(pipe).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("required")); // fail
  });

  test("argument type is not assignable to parameter type?", () => {
    when(pipe).isCalledWith({ valid: true }, false, expect(pick).type.toBeCallableWith("valid"));
  });

  test("expected an argument?", () => {
    when(pipe).isCalledWith();
  });
});
