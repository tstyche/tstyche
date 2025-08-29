import { describe, expect, test } from "tstyche";

// @tstyche fixme -- Known bug, see: #345
expect.only<never>().type.toBe<string>();

expect<string>().type.toBe<string>();
// @tstyche fixme -- Is skip?
expect<string>().type.toBe<string>();
// @tstyche fixme -- Consider removing the directive
expect.only<string>().type.toBe<string>();

// @tstyche fixme -- Is skip?
expect(() => {
  expect<number>().type.toBe<number>();
  // @tstyche fixme -- This should work, see: #265
  expect.only<never>().type.toBe<string>();
  // @tstyche fixme -- Consider removing the directive
  expect.only<string>().type.toBe<string>();
}).type.toBe<void>();

// @tstyche fixme -- Is skip?
test("is skip?", () => {
  // @tstyche fixme -- Is skip?
  expect<number>().type.toBe<number>();

  expect<never>().type.toBe<number>(); // silenced fail
  expect<string>().type.toBe<string>();
});

// @tstyche fixme
test.only("is fixme?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  expect<never>().type.toBe<number>(); // silenced fail
  expect<string>().type.toBe<string>();
});

// @tstyche fixme -- Is skip?
test("is skip?", () => {
  // @tstyche fixme -- Is skip?
  expect.only<number>().type.toBe<number>();

  // @tstyche fixme -- Is skip?
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

// @tstyche fixme -- Consider removing the directive
test.only("is number?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  // @tstyche fixme
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

test("is skip?", () => {
  // @tstyche fixme -- Is skip?
  expect<number>().type.toBe<number>();

  // @tstyche fixme -- Is skip?
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

test.only("is number?", () => {
  // @tstyche fixme -- Consider removing the directive
  expect<number>().type.toBe<number>();

  // @tstyche fixme
  expect<never>().type.toBe<number>();
  expect<number>().type.toBe<number>();
});

// @tstyche fixme -- Is skip?
describe("is skip?", () => {
  test("is skip?", () => {
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is skip?", () => {
    expect<number>().type.toBe<number>();
  });

  test("is skip?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is skip?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<string>().type.toBe<string>();
  });

  test("is skip?", () => {
    expect<number>().type.toBe<number>();
  });
});

// @tstyche fixme
describe.only("is fixme?", () => {
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  test("is number?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is fixme?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<string>().type.toBe<string>();
  });

  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });
});

// @tstyche fixme -- Is skip?
describe("is skip?", () => {
  test("is skip?", () => {
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is skip?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<string>().type.toBe<string>();
  });

  // @tstyche fixme -- Is skip?
  test("is skip?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Is skip?
    expect<number>().type.toBe<number>();
  });
});

// @tstyche fixme -- Consider removing the directive
describe.only("is describe?", () => {
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is fixme?", () => {
    expect<never>().type.toBe<number>(); // silenced fail
    expect<string>().type.toBe<string>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is number?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();
  });
});

describe("is skip?", () => {
  test("is skip?", () => {
    // @tstyche fixme -- Is skip?
    expect<number>().type.toBe<number>();

    // @tstyche fixme -- Is skip?
    expect<never>().type.toBe<number>();
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Is skip?
  test("is skip?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Is skip?
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is skip?", () => {
    // @tstyche fixme -- Is skip?
    expect<number>().type.toBe<number>();

    // @tstyche fixme -- Is skip?
    expect<never>().type.toBe<number>();

    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });
});

describe.only("is describe?", () => {
  test("is number?", () => {
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();

    // @tstyche fixme
    expect<never>().type.toBe<number>();
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme -- Consider removing the directive
  test("is number?", () => {
    expect<number>().type.toBe<number>();
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();
  });

  // @tstyche fixme
  test("is fixme?", () => {
    // @tstyche fixme -- Consider removing the directive
    expect<number>().type.toBe<number>();

    // @tstyche fixme
    expect<never>().type.toBe<number>();

    expect<never>().type.toBe<number>(); // silenced fail
    expect<number>().type.toBe<number>();
  });
});
