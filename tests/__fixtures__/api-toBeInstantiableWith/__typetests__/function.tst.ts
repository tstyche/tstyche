import { type _, describe, expect, test } from "tstyche";

function createSingle<T extends string = string>(value: T): [T] {
  return [value];
}

function createDouble<T, V>(first: T, second: V): [T, V] {
  return [first, second];
}

function createTriple<T extends string, U extends number = number, V = boolean>(
  first: T,
  second: U,
  third: V,
): [T, U, V] {
  return [first, second, third];
}

describe("when source is a function", () => {
  test("is instantiable without type arguments", () => {
    expect(createSingle).type.toBeInstantiableWith<[]>();
    expect(createSingle).type.not.toBeInstantiableWith<[]>(); // fail
  });

  test("is instantiable with the given type argument", () => {
    expect(createSingle).type.toBeInstantiableWith<[string]>();
    expect(createSingle).type.not.toBeInstantiableWith<[string]>(); // fail
  });

  test("is not instantiable with the given type argument", () => {
    expect(createDouble<_, _>).type.not.toBeInstantiableWith<[string]>();
    expect(createDouble<_, _>).type.toBeInstantiableWith<[string]>(); // fail: has no signatures for which the type argument list is applicable

    expect(createSingle).type.not.toBeInstantiableWith<[number]>();
    expect(createSingle).type.toBeInstantiableWith<[number]>(); // fail: Type 'number' does not satisfy the constraint 'string'.

    expect(createTriple<_>).type.not.toBeInstantiableWith<[number]>();
    expect(createTriple<_>).type.toBeInstantiableWith<[number]>(); // fail: Type 'number' does not satisfy the constraint 'string'.
  });

  test("is instantiable with the given type arguments", () => {
    expect(createDouble<_, _>).type.toBeInstantiableWith<[string, number]>();
    expect(createDouble<_, _>).type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect(createTriple<_>).type.toBeInstantiableWith<[string, number]>();
    expect(createTriple<_>).type.not.toBeInstantiableWith<[string, number]>(); // fail

    expect(createTriple<_>).type.toBeInstantiableWith<[string, number, boolean]>();
    expect(createTriple<_>).type.not.toBeInstantiableWith<[string, number, boolean]>(); // fail
  });

  test("is not instantiable with the given type arguments", () => {
    expect(createSingle<_>).type.not.toBeInstantiableWith<[string, string]>();
    expect(createSingle<_>).type.toBeInstantiableWith<[string, string]>(); // fail: has no signatures for which the type argument list is applicable

    expect(createDouble<_, _>).type.not.toBeInstantiableWith<[number, number, number]>();
    expect(createDouble<_, _>).type.toBeInstantiableWith<[number, number, number]>(); // fail: has no signatures for which the type argument list is applicable

    expect(createTriple<_>).type.not.toBeInstantiableWith<[string, number, boolean, boolean]>();
    expect(createTriple<_>).type.toBeInstantiableWith<[string, number, boolean, boolean]>(); // fail: has no signatures for which the type argument list is applicable

    expect(createTriple<_>).type.not.toBeInstantiableWith<[string, string]>();
    expect(createTriple<_>).type.toBeInstantiableWith<[string, string]>(); // fail: Type 'string' does not satisfy the constraint 'number'.
  });
});
