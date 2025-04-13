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

describe("argument for 'source'", () => {
  test("must be provided", () => {
    expect().type.toBeCallableWith(false);
  });

  test("must be an identifier of a callable expression", () => {
    expect("abc").type.toBeCallableWith();
    expect(123).type.toBeCallableWith();
    expect(false).type.toBeCallableWith();
    expect(undefined).type.toBeCallableWith();
    expect(null).type.toBeCallableWith();

    expect(() => undefined).type.toBeCallableWith();
    expect(() => {}).type.toBeCallableWith();
    expect(() => () => false).type.toBeCallableWith();

    expect(getPerson).type.toBeCallableWith("abc"); // allowed
    expect(getPerson("abc")).type.toBeCallableWith("abc");

    expect(getPersonGetter).type.toBeCallableWith(); // allowed
    expect(getPersonGetter()).type.toBeCallableWith("abc"); // allowed

    expect(Person).type.toBeCallableWith("abc");
  });

  test("is rejected type?", () => {
    expect("abc" as any).type.toBeCallableWith();
    expect("abc" as never).type.toBeCallableWith();
  });
});
