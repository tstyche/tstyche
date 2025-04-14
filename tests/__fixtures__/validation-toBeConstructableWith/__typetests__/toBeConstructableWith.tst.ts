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
    expect().type.toBeConstructableWith(false);
  });

  test("must be an identifier of a constructable expression", () => {
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

    expect(Person).type.toBeConstructableWith("abc"); // allowed
  });

  test("is rejected type?", () => {
    expect("abc" as any).type.toBeConstructableWith();
    expect("abc" as never).type.toBeConstructableWith();
  });
});
