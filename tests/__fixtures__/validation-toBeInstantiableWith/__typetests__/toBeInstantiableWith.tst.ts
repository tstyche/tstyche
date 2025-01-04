import { type _, describe, expect, test } from "tstyche";

type None = void;

type Single<T> = [T];

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeInstantiableWith<[never]>();
  });

  test.todo("must be a generic type", () => {
    expect(console).type.toBeInstantiableWith<[never]>();
  });
});

describe("type argument for 'Source'", () => {
  test.todo("must be a generic type", () => {
    expect<None>().type.not.toBeInstantiableWith<[]>();
    expect<PropertyKey>().type.toBeInstantiableWith<[never]>();
  });
});

describe("argument for 'target'", () => {
  test("must be type argument", () => {
    // @ts-expect-error testing purpose
    expect<Single<_>>().type.toBeInstantiableWith(["one"]);
  });
});

describe("type argument for 'Target'", () => {
  test("must be provided", () => {
    expect<Single<_>>().type.toBeInstantiableWith();
  });

  test("must be a tuple type", () => {
    // @ts-expect-error testing purpose
    expect<Single<_>>().type.toBeInstantiableWith<string>();
  });

  test("named element is not allowed", () => {
    expect<Single<_>>().type.toBeInstantiableWith<[a: string, b?: number]>();
  });

  test("rest element is not allowed", () => {
    expect<Single<_>>().type.toBeInstantiableWith<[...Array<string>, ...[number]]>();
  });
});
