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

function getPersonGetter() {
  return getPerson;
}

const obj = {
  person: () => new Person("sample"),
};

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeCallableWith(false);
  });

  test("must be a callable expression", () => {
    expect("abc").type.toBeCallableWith();
    expect(123).type.toBeCallableWith();
    expect(false).type.toBeCallableWith();
    expect(undefined).type.toBeCallableWith();
    expect(null).type.toBeCallableWith();

    expect(() => undefined).type.toBeCallableWith();
    expect(() => {}).type.toBeCallableWith();
    expect(() => () => false).type.toBeCallableWith();

    expect(getPerson("abc")).type.toBeCallableWith("abc");

    expect(Person).type.toBeCallableWith("abc");
  });

  test("allowed expressions", () => {
    expect(getPerson).type.toBeCallableWith("abc");

    expect(getPersonGetter).type.toBeCallableWith();
    expect(getPersonGetter()).type.toBeCallableWith("abc");

    expect(obj.person).type.toBeCallableWith();

    expect((a?: string) => a).type.toBeCallableWith("true");
    expect((a?: string) => a).type.toBeCallableWith();

    expect(function (a?: string) {
      return a;
    }).type.toBeCallableWith("true");
    expect(function (a?: string) {
      return a;
    }).type.toBeCallableWith();

    expect(function quick(a?: string) {
      return a;
    }).type.toBeCallableWith("true");
    expect(function quick(a?: string) {
      return a;
    }).type.toBeCallableWith();
  });

  test("is rejected type?", () => {
    expect("abc" as any).type.toBeCallableWith();
    expect("abc" as never).type.toBeCallableWith();
  });
});
