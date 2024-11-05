import { expect, test } from "tstyche";

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

interface Sample {
  [key: `data-${string}`]: string;
  isBusy?: boolean | undefined;
  runTest: (a: string, b: number) => void;
  setup: () => void;
  teardown: () => void;
}

test("Worker", () => {
  expect<Worker<Sample>>().type.toHaveProperty("data-sample");
  expect<Worker<Sample>>().type.toHaveProperty("isBusy");
  expect<Worker<Sample>>().type.toHaveProperty("runTest");

  expect<Worker<Sample>>().type.not.toHaveProperty("setup");
  expect<Worker<Sample>>().type.not.toHaveProperty("teardown");
});
