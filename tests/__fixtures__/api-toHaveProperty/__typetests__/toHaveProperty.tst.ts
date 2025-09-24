import { describe, expect, test } from "tstyche";

type Worker<T> = {
  [K in keyof T as Exclude<K, "setup" | "teardown">]: T[K];
};

const kOne = Symbol("one");
const kTwo = Symbol.for("two");
const kFour = Symbol.for("four");

const enum E1 {
  A,
  B,
  C,
}
const enum E2 {
  A = "A",
  B = "B",
  C = "C",
}

interface Sample {
  123: number;
  789?: string | undefined;
  [E1.A]: string;
  [E2.B]: string;
  __check: boolean;
  isBusy?: boolean | undefined;
  [kOne]: () => void;
  [kTwo]: () => void;
  runTest: (a: string, b: number) => void;
  setup: () => void;
  teardown: () => void;
}

const sample = {
  123: 3,
  [E1.A]: true,
  [E2.B]: null,
  __check: true,
  [kOne]: "one",
  [kTwo]: "two",
  runTest: () => false,
};

describe("when source is a type", () => {
  test("has expected string property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty("runTest");

    expect<Worker<Sample>>().type.not.toHaveProperty("runTest");
  });

  test("has expected optional string property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty("isBusy");

    expect<Worker<Sample>>().type.not.toHaveProperty("isBusy");
  });

  test("has expected escaped string property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty("__check");

    expect<Worker<Sample>>().type.not.toHaveProperty("__check");
  });

  test("does NOT have expected string property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty("endTest");

    expect<Worker<Sample>>().type.toHaveProperty("endTest");
  });

  test("has expected number property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty(123);

    expect<Worker<Sample>>().type.not.toHaveProperty(123);
  });

  test("has expected optional number property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty(789);

    expect<Worker<Sample>>().type.not.toHaveProperty(789);
  });

  test("does NOT have expected number property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty(456);

    expect<Worker<Sample>>().type.toHaveProperty(456);
  });

  test("has expected symbol property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty(kOne);

    expect<Worker<Sample>>().type.not.toHaveProperty(kOne);
  });

  test("has expected global symbol property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty(kTwo);

    expect<Worker<Sample>>().type.not.toHaveProperty(kTwo);
  });

  test("does NOT have expected symbol property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty(kFour);

    expect<Worker<Sample>>().type.toHaveProperty(kFour);
  });

  test("has expected numeric enum property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty(E1.A);

    expect<Worker<Sample>>().type.not.toHaveProperty(E1.A);
  });

  test("does NOT have expected numeric enum property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty(E1.B);

    expect<Worker<Sample>>().type.toHaveProperty(E1.B);
  });

  test("has expected string enum property key", () => {
    expect<Worker<Sample>>().type.toHaveProperty(E2.B);

    expect<Worker<Sample>>().type.not.toHaveProperty(E2.B);
  });

  test("does NOT have expected string enum property key", () => {
    expect<Worker<Sample>>().type.not.toHaveProperty(E2.A);

    expect<Worker<Sample>>().type.toHaveProperty(E2.A);
  });
});

describe("when source is an intersection", () => {
  interface Colorful {
    color: string;
  }
  interface Circle {
    radius: number;
  }

  type ColorfulCircle = Colorful & Circle;

  test("has expected property key", () => {
    expect<ColorfulCircle>().type.toHaveProperty("color");
    expect<ColorfulCircle>().type.toHaveProperty("radius");

    expect<ColorfulCircle>().type.not.toHaveProperty("radius");
  });

  test("does NOT have expected property key", () => {
    expect<ColorfulCircle>().type.not.toHaveProperty("shade");

    expect<ColorfulCircle>().type.toHaveProperty("shade");
  });
});

describe("when source is a value", () => {
  test("has expected string property key", () => {
    expect(sample).type.toHaveProperty("runTest");

    expect(sample).type.not.toHaveProperty("runTest");
  });

  test("has expected escaped string property key", () => {
    expect(sample).type.toHaveProperty("__check");

    expect(sample).type.not.toHaveProperty("__check");
  });

  test("does NOT have expected string property key", () => {
    expect(sample).type.not.toHaveProperty("endTest");

    expect(sample).type.toHaveProperty("endTest");
  });

  test("has expected number property key", () => {
    expect(sample).type.toHaveProperty(123);

    expect(sample).type.not.toHaveProperty(123);
  });

  test("does NOT have expected number property key", () => {
    expect(sample).type.not.toHaveProperty(456);

    expect(sample).type.toHaveProperty(456);
  });

  test("has expected symbol property key", () => {
    expect(sample).type.toHaveProperty(kOne);

    expect(sample).type.not.toHaveProperty(kOne);
  });

  test("has expected global symbol property key", () => {
    expect(sample).type.toHaveProperty(kTwo);

    expect(sample).type.not.toHaveProperty(kTwo);
  });

  test("does NOT have expected symbol property key", () => {
    expect(sample).type.not.toHaveProperty(kFour);

    expect(sample).type.toHaveProperty(kFour);
  });

  test("has expected numeric enum property key", () => {
    expect(sample).type.toHaveProperty(E1.A);

    expect(sample).type.not.toHaveProperty(E1.A);
  });

  test("does NOT have expected numeric enum property key", () => {
    expect(sample).type.not.toHaveProperty(E1.B);

    expect(sample).type.toHaveProperty(E1.B);
  });

  test("has expected string enum property key", () => {
    expect(sample).type.toHaveProperty(E2.B);

    expect(sample).type.not.toHaveProperty(E2.B);
  });

  test("does NOT have expected string enum property key", () => {
    expect(sample).type.not.toHaveProperty(E2.A);

    expect(sample).type.toHaveProperty(E2.A);
  });
});
