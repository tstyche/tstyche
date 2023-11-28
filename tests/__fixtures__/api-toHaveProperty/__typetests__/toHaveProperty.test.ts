import * as jest from "@jest/globals";
import { describe, expect, test } from "tstyche";

jest.test("'toHaveProperty' implementation", () => {
  jest.expect(expect).toHaveProperty("type.toHaveProperty", jest.expect.any(Function));
});

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

interface Sample {
  isBusy?: boolean | undefined;
  runTest: (a: string, b: number) => void;
  setup: () => void;
  teardown: () => void;
}

test("edge cases", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect<any>().type.toHaveProperty("abc");
  expect<any>().type.not.toHaveProperty("abc");

  expect<never>().type.not.toHaveProperty("abc");
  expect<never>().type.toHaveProperty("abc");

  expect<null>().type.not.toHaveProperty("abc");
  expect<null>().type.toHaveProperty("abc");

  expect<undefined>().type.not.toHaveProperty("abc");
  expect<undefined>().type.toHaveProperty("abc");

  expect<unknown>().type.not.toHaveProperty("abc");
  expect<unknown>().type.toHaveProperty("abc");

  expect<void>().type.not.toHaveProperty("abc");
  expect<void>().type.toHaveProperty("abc");

  expect("abc").type.toHaveProperty("startsWith");
  expect("abc").type.not.toHaveProperty("startsWith");
});

describe("received type", () => {
  test("has expected property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty("runTest");

    expect<Worker<Sample>>().type.not.toHaveProperty("runTest");
  });

  test("does NOT have expected property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty("endTest");

    expect<Worker<Sample>>().type.toHaveProperty("endTest");
  });

  test("has expected property key, but it is optional", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty("isBusy");

    expect<Worker<Sample>>().type.toHaveProperty("isBusy");
  });

  test("has expected optional property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty("isBusy?");

    expect<Worker<Sample>>().type.not.toHaveProperty("isBusy?");
  });

  test("does NOT have expected optional property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty("isRunning?");

    expect<Worker<Sample>>().type.toHaveProperty("isRunning?");
  });

  test("has expected property key, but it is NOT optional", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty("runTest?");

    expect<Worker<Sample>>().type.toHaveProperty("runTest?");
  });
});

// describe("received value", () => {
//   test("equals expected type", () => {
//     expect(getNames()).type.toEqual<{ first: string; last?: string }>();
//     expect(getNames()).type.toEqual<Names>();

//     expect(getNames()).type.toEqual<{ first: string; last: string }>();
//   });

//   test("does NOT equal expected type", () => {
//     expect(getNames()).type.not.toEqual<{ first: string; last: string }>();

//     expect(getNames()).type.not.toEqual<{ first: string; last?: string }>();
//   });

//   test("equals expected value", () => {
//     expect({ height: 14, width: 25 }).type.toEqual(getSize());

//     expect({ height: 14 }).type.toEqual(getSize());
//   });

//   test("does NOT equal expected value", () => {
//     expect({ height: 14 }).type.not.toEqual(getSize());

//     expect({ height: 14, width: 25 }).type.not.toEqual(getSize());
//   });
// });
