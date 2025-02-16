import { describe, expect, test } from "tstyche";

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
