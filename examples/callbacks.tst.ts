import { describe, expect, test, when } from "tstyche";

interface Context {
  options?: unknown;
}

declare function onEvent(handler: (eventName: "start" | "end", context: Context) => Context | void): void;

describe("onEvent", () => {
  test("when 'context' is returned", () => {
    expect(
      onEvent((eventName, context) => {
        expect(eventName).type.toBe<"start" | "end">();
        expect(context).type.toBe<Context>();

        return context;
      }),
    ).type.toBe<void>();
  });

  test("when nothing is returned", () => {
    expect(
      onEvent((eventName) => {
        expect(eventName).type.toBe<"start" | "end">();
      }),
    ).type.toBe<void>();
  });
});

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void;
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>;

test("pick", () => {
  // expect.fail(pick).type.toBeCallableWith("valid");

  when(pipe).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("valid"));
  when(pipe).isCalledWith({ valid: true }, expect(pick).type.not.toBeCallableWith("required"));
});
