import { expect } from "tstyche";

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

interface Sample {
  isBusy?: { a: boolean };
  runTest: (a: string, b: number) => void;
  setup: () => void;
}

declare const workerSample: Worker<Sample>;

expect<Worker<Sample>>().type.toHaveOptionalProperty("isBusy");
expect(workerSample).type.toHaveOptionalProperty("isBusy");
expect(workerSample.isBusy?.a).type.toEqual<boolean | undefined>();

expect<Worker<Sample>>().type.toHaveProperty("runTest");

expect<Worker<Sample>>().type.not.toHaveProperty("setup");

workerSample.isFirtst;

const kOne = Symbol("one");
// const kTwo = Symbol();

const sample = {
  [kOne]: "one",
  ["key"]: "test",
};

expect.skip(sample).type.toHaveProperty("key");
// expect(sample).type.toHaveProperty(kTwo);
