import { type _, describe, expect, test } from "tstyche";

type Single<T = string> = [T];

type Double<T, V> = [T, V];

type Triple<T extends string, U extends number = number, V = boolean> = [T, U, V];

describe("when target is a type alias", () => {
  test("can be instantiated", () => {
    expect<Single<_>>().type.toBeInstantiableWith<[]>();
    expect<Single<_>>().type.not.toBeInstantiableWith<[]>(); // fail

    expect<Single<_>>().type.toBeInstantiableWith<[string]>();
    expect<Single<_>>().type.not.toBeInstantiableWith<[string]>(); // fail

    expect<Double<_, _>>().type.toBeInstantiableWith<[string, number]>();
    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean]>(); // fail
  });

  test("requires at least type arguments", () => {
    expect<Triple<_>>().type.not.toBeInstantiableWith<[]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[]>(); // fail

    expect<Double<_, _>>().type.not.toBeInstantiableWith<[]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[]>(); // fail

    expect<Double<_, _>>().type.not.toBeInstantiableWith<[string]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[string]>(); // fail
  });

  test("takes at most type arguments", () => {
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, number, boolean, boolean]>();
    expect<Triple<_>>().type.toBeInstantiableWith<[string, number, boolean, boolean]>(); // fail

    expect<Double<_, _>>().type.not.toBeInstantiableWith<[number, number, number]>();
    expect<Double<_, _>>().type.toBeInstantiableWith<[number, number, number]>(); // fail

    expect<Single<_>>().type.not.toBeInstantiableWith<[string, string]>();
    expect<Single<_>>().type.toBeInstantiableWith<[string, string]>(); // fail
  });

  test("constraint is not satisfied", () => {
    expect<Triple<_>>().type.toBeInstantiableWith<[number]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[number]>(); // fail

    expect<Triple<_>>().type.toBeInstantiableWith<[string, string]>();
    expect<Triple<_>>().type.not.toBeInstantiableWith<[string, string]>(); // fail
  });
});
