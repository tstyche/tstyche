import { expect, test } from "tstyche";

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
  expect(options).type.toMatch<{ readonly environment?: string }>();
  expect(options).type.toMatch<{ timers?: "fake" | "real" }>();
});

expect<"fake" | "real">().type.toBeAssignableWith<"fake">();
// But type '"fake" | "real"' is not assignable to type '"fake"'
expect<"fake" | "real">().type.not.toMatch<"fake">();

expect<string>().type.toBeAssignableWith<"node">();
// But type 'string' is not assignable to type '"node"'
expect<string>().type.not.toMatch<"node">();
