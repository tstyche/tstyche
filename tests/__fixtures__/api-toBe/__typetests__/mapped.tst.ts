import { expect, test } from "tstyche";

type Simplify<T> = { [K in keyof T]: T[K] };

type A = { readonly a: string; readonly b: number };
type B = { a?: string; b?: number };
type C = { a: string } & { readonly b?: number } & (() => boolean);

class Sample {
  get a(): string {
    return "abc";
  }

  get b(): number {
    return 123;
  }

  set b(x: number) {
    // ...
  }
}

test("mapping modifiers: readonly", () => {
  type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
  };

  expect<Mutable<A>>().type.toBe<{ a: string; b: number }>();
  expect<Mutable<C>>().type.toBe<{ a: string; b?: number }>();

  expect<Readonly<B>>().type.toBe<{ readonly a?: string; readonly b?: number }>();
  expect<Readonly<C>>().type.toBe<{ readonly a: string; readonly b?: number }>();

  expect<Simplify<Mutable<A>>>().type.toBe<{ a: string; b: number }>();
  expect<Simplify<Readonly<B>>>().type.toBe<{ readonly a?: string; readonly b?: number }>();

  expect<Pick<Sample, "a">>().type.toBe<{ readonly a: string }>();
  expect<Pick<Sample, "b">>().type.toBe<{ b: number }>();
});

test("mapping modifiers: optional", () => {
  expect<Partial<A>>().type.toBe<{ readonly a?: string; readonly b?: number }>();
  expect<Partial<B>>().type.toBe<{ a?: string; b?: number }>();
  expect<Partial<C>>().type.toBe<{ a?: string; readonly b?: number }>();

  expect<Required<A>>().type.toBe<{ readonly a: string; readonly b: number }>();
  expect<Required<B>>().type.toBe<{ a: string; b: number }>();
  expect<Required<C>>().type.toBe<{ a: string; readonly b: number }>();

  expect<Simplify<Partial<A>>>().type.toBe<{ readonly a?: string; readonly b?: number }>();
  expect<Simplify<Required<B>>>().type.toBe<{ a: string; b: number }>();
});

test("remapped keys", () => {
  type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
  };

  interface Person {
    name: string;
    age: number;
  }

  expect<Getters<Person>>().type.toBe<{
    getName: () => string;
    getAge: () => number;
  }>();

  type RemoveKind<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property];
  };

  interface Circle {
    kind: "circle";
    radius: number;
  }

  expect<RemoveKind<Circle>>().type.toBe<{ radius: number }>();
});
