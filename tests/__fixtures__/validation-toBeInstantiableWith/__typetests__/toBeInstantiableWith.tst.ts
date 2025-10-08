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

type None = void;

type Box<T = string> = {
  toArray: () => Array<T>;
};

interface Holder<T> {
  contents: T;
  getContents: () => T;
}

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeInstantiableWith<[never]>();
  });

  test("must be a instantiable expression", () => {
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

  test("is rejected type?", () => {
    expect("abc" as any).type.toBeInstantiableWith<[never]>();
    expect("abc" as never).type.toBeInstantiableWith<[never]>();
  });
});

describe("type argument for 'Source'", () => {
  test("must be a instantiable type", () => {
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
    expect<Box>().type.toBeInstantiableWith<[string]>();
    expect<Box<_>>().type.toBeInstantiableWith<[string]>();
    expect<Holder<_>>().type.toBeInstantiableWith<[string]>();
  });

  test("is rejected type?", () => {
    type Any = any;
    type Never = never;

    expect<Any>().type.toBeInstantiableWith<[never]>();
    expect<Never>().type.toBeInstantiableWith<[never]>();
  });
});

// describe("type argument for 'Source'", () => {
//   test.todo("must be a generic type", () => {
//     expect<None>().type.not.toBeInstantiableWith<[]>();
//     expect<PropertyKey>().type.toBeInstantiableWith<[never]>();
//   });
// });

// describe("argument for 'target'", () => {
//   test("must be type argument", () => {
//     // @ts-expect-error!
//     expect<Single<_>>().type.toBeInstantiableWith(["one"]);
//   });
// });

// describe("type argument for 'Target'", () => {
//   test("must be provided", () => {
//     expect<Single<_>>().type.toBeInstantiableWith<[never]>();
//   });

//   test("must be a tuple type", () => {
//     // @ts-expect-error!
//     expect<Single<_>>().type.toBeInstantiableWith<string>();
//   });
// });
