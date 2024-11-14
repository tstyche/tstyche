import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeAssignableWith<{ test: void }>();
  });

  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect({} as any).type.toBeAssignableTo<{ a: number }>(); // use '.toBeAny()'
    expect({} as any).type.not.toBeAssignableTo<{ a: number }>();

    expect({} as never).type.toBeAssignableTo<{ a: number }>(); // use '.toBeNever()'
    expect({} as never).type.not.toBeAssignableTo<{ a: number }>();

    expect({} as unknown).type.not.toBeAssignableTo<{ a: number }>(); // use '.toBeUnknown()'
    expect({} as unknown).type.toBeAssignableTo<{ a: number }>();
  });
});

describe("type argument for 'Source'", () => {
  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<any>().type.toBeAssignableWith<{ a: number }>(); // use '.toBeAny()'
    expect<any>().type.not.toBeAssignableWith<{ a: number }>();

    expect<unknown>().type.toBeAssignableWith<{ a: number }>(); // use '.toBeUnknown()'
    expect<unknown>().type.not.toBeAssignableWith<{ a: number }>();

    expect<never>().type.not.toBeAssignableWith<{ a: number }>(); // use '.toBeNever()'
    expect<never>().type.toBeAssignableWith<{ a: number }>();
  });
});

describe("argument for 'target'", () => {
  test("must be provided", () => {
    expect<{ test: void }>().type.toBeAssignableWith();
  });

  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<{ a: number }>().type.toBeAssignableWith({} as any); // use '.toBeAny()'
    expect<{ a: number }>().type.not.toBeAssignableWith({} as any);

    expect<{ a: number }>().type.toBeAssignableWith({} as never); // use '.toBeNever()'
    expect<{ a: number }>().type.not.toBeAssignableWith({} as never);

    expect<{ a: string }>().type.not.toBeAssignableWith({} as unknown); // use '.toBeUnknown()'
    expect<{ a: string }>().type.toBeAssignableWith({} as unknown);
  });
});

describe("type argument for 'Target'", () => {
  test("cannot be of type 'any', 'never' or 'unknown'", () => {
    expect<{ a: number }>().type.toBeAssignableWith<any>(); // use '.toBeAny()'
    expect<{ a: number }>().type.not.toBeAssignableWith<any>();

    expect<{ a: number }>().type.toBeAssignableWith<never>(); // use '.toBeNever()'
    expect<{ a: number }>().type.not.toBeAssignableWith<never>();

    expect<{ a: string }>().type.not.toBeAssignableWith<unknown>(); // use '.toBeUnknown()'
    expect<{ a: string }>().type.toBeAssignableWith<unknown>();
  });
});
