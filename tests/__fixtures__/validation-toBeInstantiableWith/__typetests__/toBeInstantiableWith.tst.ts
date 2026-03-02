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

interface Box<T> {
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
    expect("abc" as any).type.toBeInstantiableWith<[never]>();
    expect("abc" as never).type.toBeInstantiableWith<[never]>();

    expect("abc").type.toBeInstantiableWith<[never]>();
    expect(123).type.toBeInstantiableWith<[never]>();
    expect(false).type.toBeInstantiableWith<[never]>();
    expect(undefined).type.toBeInstantiableWith<[never]>();
    expect(null).type.toBeInstantiableWith<[never]>();

    expect(() => undefined).type.toBeInstantiableWith<[never]>();
    expect(Person).type.toBeInstantiableWith<[never]>();
  });

  test("allowed expressions", () => {
    expect(readOption).type.toBeInstantiableWith<[string]>();
    expect(Container).type.toBeInstantiableWith<[string]>();
  });
});

describe("type argument for 'Source'", () => {
  test("must be an instantiable type", () => {
    type Any = any;
    type Never = never;

    expect<Any>().type.toBeInstantiableWith<[never]>();
    expect<Never>().type.toBeInstantiableWith<[never]>();

    expect<string>().type.toBeInstantiableWith<[never]>();
    expect<number>().type.toBeInstantiableWith<[never]>();
    expect<boolean>().type.toBeInstantiableWith<[never]>();
    expect<undefined>().type.toBeInstantiableWith<[never]>();
    expect<null>().type.toBeInstantiableWith<[never]>();

    expect<() => void>().type.toBeInstantiableWith<[never]>();
    expect<Func>().type.toBeInstantiableWith<[never]>();

    expect<Person>().type.toBeInstantiableWith<[never]>();
    expect<new () => Person>().type.toBeInstantiableWith<[never]>();

    expect<None>().type.toBeInstantiableWith<[never]>();
  });

  test("allowed expressions", () => {
    expect<Container<_>>().type.toBeInstantiableWith<[string]>();
    expect<WithLoading>().type.toBeInstantiableWith<[string]>();
    expect<WithLoading<_>>().type.toBeInstantiableWith<[string]>();
    expect<Box<_>>().type.toBeInstantiableWith<[string]>();
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
