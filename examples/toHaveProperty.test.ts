import { expect } from "tstyche";

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

interface Sample {
  isBusy?: boolean | undefined;
  runTest: (a: string, b: number) => void;
  setup: () => void;
  teardown: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
expect<any>().type.toHaveProperty("abc");
expect<never>().type.not.toHaveProperty("abc");
expect<null>().type.not.toHaveProperty("abc");
expect<undefined>().type.not.toHaveProperty("abc");
expect<unknown>().type.not.toHaveProperty("abc");
expect<void>().type.not.toHaveProperty("abc");

expect("abc").type.toHaveProperty("startsWith");

expect<Worker<Sample>>().type.toHaveProperty(`isBusy?`);
expect<Worker<Sample>>().type.toHaveProperty("runTest");

expect.fail<Worker<Sample>>().type.toHaveProperty("setup"); // Error: Property 'setup' does not exist on type 'X'.

expect<Worker<Sample>>().type.not.toHaveProperty("setup");
expect<Worker<Sample>>().type.not.toHaveProperty("teardown");
