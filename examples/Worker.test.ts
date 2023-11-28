import { expect } from "tstyche";

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

interface Sample {
  isBusy?: boolean | undefined;
  runTest: (a: string, b: number) => void;
  setup: () => void;
}

expect<Worker<Sample>>().type.toHaveProperty("isBusy?");
expect<Worker<Sample>>().type.toHaveProperty("runTest");

expect<Worker<Sample>>().type.not.toHaveProperty("setup");
