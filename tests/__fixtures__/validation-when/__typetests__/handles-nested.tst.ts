import { describe, expect, it, test, when } from "tstyche";

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void;
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>;

when(pipe).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("valid"));

when(pipe).isCalledWith(
  { valid: true },
  describe("cannot be nested", () => {
    //
  }),
);

when(pipe).isCalledWith(
  { valid: true },
  it("cannot be nested", () => {
    //
  }),
);

when(pipe).isCalledWith(
  { valid: true },
  test("cannot be nested", () => {
    //
  }),
);

expect(() => {
  // can be nested!
  when(pipe).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("valid"));
}).type.toBe<void>();
