import { expect, test } from "tstyche";

interface Context {
  options?: unknown;
}

declare function onEvent(handler: (eventName: "start" | "end", context: Context) => Context): void;

test("onEvent", () => {
  expect(
    onEvent((eventName, context) => {
      expect(eventName).type.toBe<"start" | "end">();
      expect(context).type.toBe<Context>();

      return context;
    }),
  ).type.toBe<void>();
});
