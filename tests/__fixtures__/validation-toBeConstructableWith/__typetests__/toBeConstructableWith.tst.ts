import { describe, expect, test } from "tstyche";

class Person {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }
}

function getPerson(name: string) {
  return new Person(name);
}

function getPersonConstructor() {
  return Person;
}

function getPersonGetter() {
  return getPerson;
}

const obj = {
  // biome-ignore lint/style/useNamingConvention: testing purpose
  Person,
};

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeConstructableWith(false);
  });

  test("must be a constructable expression", () => {
    expect("abc").type.toBeConstructableWith();
    expect(123).type.toBeConstructableWith();
    expect(false).type.toBeConstructableWith();
    expect(undefined).type.toBeConstructableWith();
    expect(null).type.toBeConstructableWith();

    expect(() => undefined).type.toBeConstructableWith();
    expect(() => {}).type.toBeConstructableWith();
    expect(() => () => false).type.toBeConstructableWith();

    expect(getPerson).type.toBeConstructableWith("abc");
    expect(getPerson("abc")).type.toBeConstructableWith("abc");

    expect(getPersonGetter).type.toBeConstructableWith();
    expect(getPersonGetter()).type.toBeConstructableWith("abc");
    expect(getPersonConstructor).type.toBeConstructableWith("abc");
  });

  test("allowed expressions", () => {
    expect(getPersonConstructor()).type.toBeConstructableWith("abc");
    expect(Person).type.toBeConstructableWith("abc");
    expect({} as typeof Person).type.toBeConstructableWith("abc");
    expect({} as new (name: string) => Person).type.toBeConstructableWith("abc");
    expect(obj.Person).type.toBeConstructableWith("abc");
  });

  test("is rejected type?", () => {
    expect("abc" as any).type.toBeConstructableWith();
    expect("abc" as never).type.toBeConstructableWith();
  });
});

describe("type argument for 'Source'", () => {
  test("must be a constructable type", () => {
    expect<string>().type.toBeConstructableWith();
    expect<number>().type.toBeConstructableWith();
    expect<boolean>().type.toBeConstructableWith();
    expect<undefined>().type.toBeConstructableWith();
    expect<null>().type.toBeConstructableWith();

    expect<() => undefined>().type.toBeConstructableWith();
    expect<() => void>().type.toBeConstructableWith();
    expect<() => () => boolean>().type.toBeConstructableWith();

    type Func = (arg: string) => void;
    expect<Func>().type.toBeCallableWith("abc");

    expect<Person>().type.toBeConstructableWith("abc");

    expect<typeof Person>().type.toBeConstructableWith("abc");
    expect<new (name: string) => Person>().type.toBeConstructableWith("abc");
  });

  test("is rejected type?", () => {
    type Any = any;
    type Never = never;

    expect<Any>().type.toBeConstructableWith();
    expect<Never>().type.toBeConstructableWith();
  });
});
