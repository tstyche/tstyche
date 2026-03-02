import { type _, describe, expect, test } from "tstyche";

declare function readOption<T>(section: string): T | undefined;
declare function readOption<T>(section: string, defaultValue: T): T;

type Func = (arg: string) => void;

class Person {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }
}

class Container<T> {
  private items: Array<T> = [];

  add(item: T): void {
    this.items.push(item);
  }
}

interface Box<T = unknown> {
  contents: T;
  getContents: () => T;
}

type None = void;

type WithLoading<T = object> = T & { loading: boolean };

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeInstantiableWith<[never]>();
  });

  test("must be an instantiable expression", () => {
    expect("abc").type.toBeInstantiableWith<[never]>();
    expect(123).type.toBeInstantiableWith<[never]>();
    expect(false).type.toBeInstantiableWith<[never]>();
    expect(undefined).type.toBeInstantiableWith<[never]>();
    expect(null).type.toBeInstantiableWith<[never]>();
    expect(() => undefined).type.toBeInstantiableWith<[never]>();
  });

  test("allowed expressions", () => {
    expect(Person).type.toBeInstantiableWith<[]>();

    expect(readOption).type.toBeInstantiableWith<[string]>();
    expect(Container).type.toBeInstantiableWith<[string]>();
  });
});

describe("type argument for 'Source'", () => {
  test("must be an instantiable type", () => {
    expect<string>().type.toBeInstantiableWith<[never]>();
    expect<number>().type.toBeInstantiableWith<[never]>();
    expect<boolean>().type.toBeInstantiableWith<[never]>();
    expect<undefined>().type.toBeInstantiableWith<[never]>();
    expect<null>().type.toBeInstantiableWith<[never]>();

    expect<() => void>().type.toBeInstantiableWith<[never]>();
    expect<new () => Person>().type.toBeInstantiableWith<[never]>();
  });

  test("allowed expressions", () => {
    expect<Func>().type.toBeInstantiableWith<[]>();

    expect<Person>().type.toBeInstantiableWith<[]>();
    expect<Container<_>>().type.toBeInstantiableWith<[string]>();

    expect<Box>().type.toBeInstantiableWith<[string]>();
    expect<Box<_>>().type.toBeInstantiableWith<[string]>();

    expect<None>().type.toBeInstantiableWith<[]>();
    expect<WithLoading>().type.toBeInstantiableWith<[string]>();
    expect<WithLoading<_>>().type.toBeInstantiableWith<[string]>();
  });
});

describe("type argument for 'Target'", () => {
  test("must be provided", () => {
    expect<Box<_>>().type.toBeInstantiableWith();
  });

  test("must be type argument", () => {
    // @ts-expect-error!
    expect<Box<_>>().type.toBeInstantiableWith(["one"]);
  });

  test("must be a tuple type", () => {
    // @ts-expect-error!
    expect<Box<_>>().type.toBeInstantiableWith<string>();
  });
});
