import { describe, expect, test } from "tstyche";

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

interface Sample {
  isBusy?: boolean | undefined;
  runTest: (a: string, b: number) => void;
  setup: () => void;
  teardown: () => void;
}

describe("argument for 'source'", () => {
  test("must be of an object type", () => {
    expect("sample").type.toHaveProperty("runTest");
  });
});

describe("type argument for 'Source'", () => {
  test("must be of an object type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect<any>().type.toHaveProperty("runTest");
  });
});

describe("argument for 'key'", () => {
  test("must be of type 'string | number | symbol'", () => {
    // @ts-expect-error test
    expect<Worker<Sample>>().type.toHaveProperty(["isBusy", "runTest"]);
  });
});
