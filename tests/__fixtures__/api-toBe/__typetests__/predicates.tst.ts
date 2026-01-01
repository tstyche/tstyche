import { expect, test } from "tstyche";

interface Bird {
  fly: () => void;
}

interface Fish {
  swim: () => void;
}

type Pet = Bird | Fish;

function isBird(pet: Pet): pet is Bird {
  return "fly" in pet;
}

function isFish(pet: Pet): pet is Fish {
  return "swim" in pet;
}

function assertIsBird(target: any): asserts target is Bird {
  // ...
}

function assertIsFish(target: any): asserts target is Fish {
  // ...
}

test("'is' type predicate", () => {
  expect(isBird).type.toBe<(pet: Pet) => pet is Bird>();
  expect(isBird).type.not.toBe<(pet: Pet) => asserts pet is Bird>();
  expect(isBird).type.not.toBe<(pet: Pet) => pet is Fish>();
  expect(isBird).type.not.toBe<(pet: Pet) => boolean>();

  expect(isFish).type.toBe<(pet: Pet) => pet is Fish>();
  expect(isFish).type.not.toBe<(pet: Pet) => asserts pet is Fish>();
  expect(isFish).type.not.toBe<(pet: Pet) => pet is Bird>();
  expect(isFish).type.not.toBe<(pet: Pet) => boolean>();
});

test("'asserts' type predicate", () => {
  expect(assertIsBird).type.toBe<(target: any) => asserts target is Bird>();
  expect(assertIsBird).type.not.toBe<(target: any) => target is Bird>();
  expect(assertIsBird).type.not.toBe<(target: any) => asserts target is Fish>();
  expect(assertIsBird).type.not.toBe<(target: any) => void>();

  expect(assertIsFish).type.toBe<(target: any) => asserts target is Fish>();
  expect(assertIsBird).type.not.toBe<(target: any) => target is Fish>();
  expect(assertIsFish).type.not.toBe<(target: any) => asserts target is Bird>();
  expect(assertIsFish).type.not.toBe<(target: any) => void>();
});

class FileSystemObject {
  isDirectory(): this is Directory & this {
    return this instanceof Directory;
  }
  isNetworked(): asserts this is { host: string } & this {
    // ...
  }
}

class Directory extends FileSystemObject {
  children!: Array<FileSystemObject>;
}

const fso = new FileSystemObject();

test("'this is' type predicate", () => {
  expect(fso.isDirectory).type.toBe<() => this is Directory & FileSystemObject>();
  expect(fso.isDirectory).type.not.toBe<() => asserts this is Directory & FileSystemObject>();
  expect(fso.isDirectory).type.not.toBe<() => this is { host: string } & FileSystemObject>();
  expect(fso.isDirectory).type.not.toBe<() => boolean>();
});

test("'asserts this' type predicate", () => {
  expect(fso.isNetworked).type.toBe<() => asserts this is { host: string } & FileSystemObject>();
  expect(fso.isNetworked).type.not.toBe<() => this is { host: string } & FileSystemObject>();
  expect(fso.isNetworked).type.not.toBe<() => asserts this is Directory & FileSystemObject>();
  expect(fso.isNetworked).type.not.toBe<() => void>();
});
