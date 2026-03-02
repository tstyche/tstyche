import { type _, describe, expect, test } from "tstyche";

class Single<T extends string = string> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}

class Double<T, V> {
  first: T;
  second: V;

  constructor(first: T, second: V) {
    this.first = first;
    this.second = second;
  }

  getPair(): [T, V] {
    return [this.first, this.second];
  }
}

class Triple<T extends string, U extends number = number, V = boolean> {
  first: T;
  second: U;
  third: V;

  constructor(first: T, second: U = 0 as U, third: V = true as V) {
    this.first = first;
    this.second = second;
    this.third = third;
  }

  getTriple(): [T, U, V] {
    return [this.first, this.second, this.third];
  }
}

describe("when source is a class", () => {
  test("is instantiable without type arguments", () => {
    expect(Single).type.toBeInstantiableWith<[]>();
    expect(Single).type.not.toBeInstantiableWith<[]>(); // fail
  });

  test("is instantiable with the given type argument", () => {
    expect(Single).type.toBeInstantiableWith<[string]>();
    expect(Single).type.not.toBeInstantiableWith<[string]>(); // fail
  });

  test("is not instantiable with the given type argument", () => {
    expect(Double<_, _>).type.not.toBeInstantiableWith<[string]>();
    expect(Double<_, _>).type.toBeInstantiableWith<[string]>(); // fail: Type 'typeof Double' has no signatures for which the type argument list is applicable.

    expect(Single).type.not.toBeInstantiableWith<[number]>();
    expect(Single).type.toBeInstantiableWith<[number]>(); // fail: Type 'number' does not satisfy the constraint 'string'.

    expect(Triple<_>).type.not.toBeInstantiableWith<[number]>();
    expect(Triple<_>).type.toBeInstantiableWith<[number]>(); // fail: Type 'number' does not satisfy the constraint 'string'.
  });

  test("is instantiable with the given type arguments", () => {
    expect(Double<_, _>).type.toBeInstantiableWith<[string, number]>();
    expect(Double<_, _>).type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect(Triple<_>).type.toBeInstantiableWith<[string, number]>();
    expect(Triple<_>).type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect(Triple<_>).type.toBeInstantiableWith<[string, number, boolean]>();
    expect(Triple<_>).type.not.toBeInstantiableWith<[string, number, boolean]>(); // fail
  });

  test("is not instantiable with the given type arguments", () => {
    expect(Single<_>).type.not.toBeInstantiableWith<[string, string]>();
    expect(Single<_>).type.toBeInstantiableWith<[string, string]>(); // fail: Type 'typeof Single' has no signatures for which the type argument list is applicable.

    expect(Double<_, _>).type.not.toBeInstantiableWith<[number, number, number]>();
    expect(Double<_, _>).type.toBeInstantiableWith<[number, number, number]>(); // fail: Type 'typeof Double' has no signatures for which the type argument list is applicable.

    expect(Triple<_>).type.not.toBeInstantiableWith<[string, number, boolean, boolean]>();
    expect(Triple<_>).type.toBeInstantiableWith<[string, number, boolean, boolean]>(); // fail: Type 'typeof Triple' has no signatures for which the type argument list is applicable.

    expect(Triple<_>).type.not.toBeInstantiableWith<[string, string]>();
    expect(Triple<_>).type.toBeInstantiableWith<[string, string]>(); // fail: Type 'string' does not satisfy the constraint 'number'.
  });
});
