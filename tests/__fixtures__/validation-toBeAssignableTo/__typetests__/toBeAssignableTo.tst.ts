import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeAssignableTo<{ test: void }>();
  });

  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<any>().type.toBeAssignableTo<{ a: number }>(); // use '.toBeAny()'
    expect<any>().type.not.toBeAssignableTo<{ a: number }>();

    expect<never>().type.toBeAssignableTo<{ a: number }>(); // use '.toBeNever()'
    expect<never>().type.not.toBeAssignableTo<{ a: number }>();

    expect<unknown>().type.not.toBeAssignableTo<{ a: number }>(); // use '.toBeUnknown()'
    expect<unknown>().type.toBeAssignableTo<{ a: number }>();
  });
});

describe("type argument for 'Source'", () => {
  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<any>().type.toBeAssignableTo<{ a: number }>(); // use '.toBeAny()'
    expect<any>().type.not.toBeAssignableTo<{ a: number }>();

    expect<never>().type.toBeAssignableTo<{ a: number }>(); // use '.toBeNever()'
    expect<never>().type.not.toBeAssignableTo<{ a: number }>();

    expect<unknown>().type.not.toBeAssignableTo<{ a: number }>(); // use '.toBeUnknown()'
    expect<unknown>().type.toBeAssignableTo<{ a: number }>();
  });
});

describe("argument for 'target'", () => {
  test("must be provided", () => {
    expect<{ test: void }>().type.toBeAssignableTo();
  });

  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<{ a: number }>().type.toBeAssignableTo({} as any); // use '.toBeAny()'
    expect<{ a: number }>().type.not.toBeAssignableTo({} as any);

    expect<{ a: number }>().type.toBeAssignableTo({} as unknown); // use '.toBeUnknown()'
    expect<{ a: number }>().type.not.toBeAssignableTo({} as unknown);

    expect<{ a: number }>().type.not.toBeAssignableTo({} as never); // use '.toBeNever()'
    expect<{ a: number }>().type.toBeAssignableTo({} as never);
  });
});

describe("type argument for 'Target'", () => {
  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<{ a: number }>().type.toBeAssignableTo<any>(); // use '.toBeAny()'
    expect<{ a: number }>().type.not.toBeAssignableTo<any>();

    expect<{ a: number }>().type.toBeAssignableTo<unknown>(); // use '.toBeUnknown()'
    expect<{ a: number }>().type.not.toBeAssignableTo<unknown>();

    expect<{ a: number }>().type.not.toBeAssignableTo<never>(); // use '.toBeNever()'
    expect<{ a: number }>().type.toBeAssignableTo<never>();
  });
});
