import { describe, expect, test } from "tstyche";

interface HasBoth {
  new (): Date;
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
      expect<HasBoth>().type.toHaveCallSignatures();

      expect<() => void>().type.not.toHaveCallSignatures(); // fail
      expect<HasBoth>().type.not.toHaveCallSignatures(); // fail
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
