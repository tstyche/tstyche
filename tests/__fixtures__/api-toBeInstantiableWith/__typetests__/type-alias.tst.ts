import { type _, describe, expect, test } from "tstyche";

type Single<T extends string = string> = [T];

type Double<T, V> = [T, V];

type Triple<T extends string, U extends number = number, V = boolean> = [T, U, V];

describe("when source is a type alias", () => {
  test("is instantiable without type arguments", () => {
    expect<Single>().type.toBeInstantiableWith();
    expect<Single>().type.not.toBeInstantiableWith(); // fail
  });

  test("is not instantiable without type arguments", () => {
    expect<Double<_, _>>().type.not.toBeInstantiableWith();
    expect<Double<_, _>>().type.toBeInstantiableWith(); // fail: Generic type 'Double' requires 2 type argument(s).

    expect<Triple<_>>().type.not.toBeInstantiableWith();
    expect<Triple<_>>().type.toBeInstantiableWith(); // fail: Generic type 'Triple' requires between 1 and 3 type arguments.
  });

  test("is instantiable with the given type argument", () => {
    expect<Single>().type.toBeInstantiableWith<[string]>();
    expect<Single>().type.not.toBeInstantiableWith<[string]>(); // fail
  });

  test("is not instantiable with the given type argument", () => {
    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[string]>(); // fail: Generic type 'Double' requires 2 type argument(s).

    expect<Single>().type.not.toBeInstantiableWith<[number]>();
    expect<Single>().type.toBeInstantiableWith<[number]>(); // fail: Type 'number' does not satisfy the constraint 'string'.

    expect<Triple<_>>().type.not.toBeInstantiableWith<[number]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[number]>(); // fail: Type 'number' does not satisfy the constraint 'string'.
  });

  test("is instantiable with the given type arguments", () => {
    expect<Double<_, _>>().type.toBeInstantiableWith<[string, number]>();
    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean]>(); // fail
  });

  test("is not instantiable with the given type arguments", () => {
    expect<Single<_>>().type.not.toBeInstantiableWith<[string, string]>();
    expect<Single<_>>().type.toBeInstantiableWith<[string, string]>(); // fail: Generic type 'Single' requires between 0 and 1 type arguments.

    expect<Double<_, _>>().type.not.toBeInstantiableWith<[number, number, number]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[number, number, number]>(); // fail: Generic type 'Double' requires 2 type argument(s).

    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean, boolean]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean, boolean]>(); // fail: Generic type 'Triple' requires between 1 and 3 type arguments.

    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, string]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[string, string]>(); // fail: Type 'string' does not satisfy the constraint 'number'.
  });
});
