import { describe, expect, test } from "tstyche";

interface CallOrConstruct {
  new (): Date;
  new (value: number | string): Date;
  (): string;
}

class Person {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }
}

describe("when source is a type", () => {
  describe("when target is omitted", () => {
    test("has call signatures", () => {
      expect<() => void>().type.toHaveCallSignatures();
      expect<CallOrConstruct>().type.toHaveCallSignatures();

      expect<() => void>().type.not.toHaveCallSignatures(); // fail
      expect<CallOrConstruct>().type.not.toHaveCallSignatures(); // fail
    });

    test("does NOT have call signatures", () => {
      expect<Person>().type.not.toHaveCallSignatures();
      expect<Person>().type.toHaveCallSignatures(); // fail
    });
  });
});

describe("when source is an expression", () => {
  describe("when target is omitted", () => {
    test("has call signatures", () => {
      expect(() => {}).type.toHaveCallSignatures();
      expect(Date).type.toHaveCallSignatures();

      expect(() => {}).type.not.toHaveCallSignatures(); // fail
      expect(Date).type.not.toHaveCallSignatures(); // fail
    });

    test("does NOT have call signatures", () => {
      expect(Person).type.not.toHaveCallSignatures();
      expect(Person).type.toHaveCallSignatures(); // fail
    });
  });
});
