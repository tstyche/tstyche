import { expect, test } from "tstyche";

interface Options {
  locale?: Array<"en" | "de">;
  root?: string;
}

test("is assignable?", () => {
  expect<Options>().type.toBeAssignable({});

  expect<Options>().type.toBeAssignable({
    locale: ["en" as const, "de" as const],
    root: "./",
  });
});

interface Options {
  environment?: string;
  timers?: "fake" | "real";
}

const options: Options = {};

test("is a match?", () => {
  expect(options).type.toMatch<{ environment?: string }>();
  expect(options).type.toMatch<{ timers?: "fake" | "real" }>();
});

expect<"fake" | "real">().type.toBeAssignable<"fake">();
// But type '"fake" | "real"' is not assignable to type '"fake"'
expect<"fake" | "real">().type.not.toMatch<"fake">();

expect<string>().type.toBeAssignable<"node">();
// But type 'string' is not assignable to type '"node"'
expect<string>().type.not.toMatch<"node">();
