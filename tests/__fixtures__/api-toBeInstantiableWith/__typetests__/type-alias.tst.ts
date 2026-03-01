import { type _, describe, expect, test } from "tstyche";

type Single<T = string> = [T];

type Double<T, V> = [T, V];

type Triple<T extends string, U extends number = number, V = boolean> = [T, U, V];

describe("when source is a type alias", () => {
  test("is instantiable without type arguments", () => {
    expect<Single>().type.toBeInstantiableWith();
    expect<Single>().type.not.toBeInstantiableWith(); // fail
  });

  test("is instantiable with the given type argument", () => {
    expect<Double<_, _>>().type.toBeInstantiableWith<[string, number]>();
    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean]>(); // fail
  });

  test("is instantiable with the given type arguments", () => {
    expect<Double<_, _>>().type.toBeInstantiableWith<[string, number]>();
    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean]>(); // fail
  });

  test.todo("can NOT be instantiated", () => {
    // requires at least type arguments

    expect<Triple<_>>().type.not.toBeInstantiableWith();
    expect<Triple<_>>().type.toBeInstantiableWith(); // fail

    expect<Double<_, _>>().type.not.toBeInstantiableWith();
    expect<Double<_, _>>().type.toBeInstantiableWith(); // fail

    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[string]>(); // fail

    // takes at most type arguments

    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean, boolean]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean, boolean]>(); // fail

    expect<Double<_, _>>().type.not.toBeInstantiableWith<[number, number, number]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[number, number, number]>(); // fail

    expect<Single<_>>().type.not.toBeInstantiableWith<[string, string]>();
    expect<Single<_>>().type.toBeInstantiableWith<[string, string]>(); // fail

    // constraint is not satisfied

    expect<Triple<_>>().type.not.toBeInstantiableWith<[number]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[number]>(); // fail

    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, string]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[string, string]>(); // fail
  });
});
