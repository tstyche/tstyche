import { expect, pick, test } from "tstyche";

interface Options {
  locale?: Array<"en" | "de">;
  root?: string;
}

test("is assignable?", () => {
  expect<Options>().type.toBeAssignableWith({});

  expect<Options>().type.toBeAssignableWith({
    locale: ["en" as const, "de" as const],
    root: "./",
  });
});

interface Options {
  readonly environment?: string;
  timers?: "fake" | "real";
}

const options: Options = {};

test("is a match?", () => {
  expect(pick(options, "environment")).type.toBe<{ readonly environment?: string }>();

  expect(pick(options, "timers")).type.toBe<{ timers?: "fake" | "real" }>();
});
