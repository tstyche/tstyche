import { expect, test } from "tstyche";

type Simplify<T> = { [K in keyof T]: T[K] };

type A = { readonly a: string; readonly b: number };
type B = { a?: string; b?: number };
type C = { a: string } & { readonly b?: number } & (() => boolean);

class Alpha {
  get a(): string {
    return "abc";
  }

  get b(): number {
    return 123;
  }

  set b(x: number) {
    // ...
  }

  c?: boolean;
}

class Bravo extends Alpha {
  override c = true;
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

  expect<Pick<Alpha, "a">>().type.toBe<{ readonly a: string }>();
  expect<Pick<Alpha, "b">>().type.toBe<{ b: number }>();

  expect<Pick<Bravo, "a">>().type.toBe<{ readonly a: string }>();
  expect<Pick<Bravo, "b">>().type.toBe<{ b: number }>();
  expect<Pick<Bravo, "c">>().type.toBe<{ c: boolean }>();

  expect<Pick<Mutable<Bravo>, "a">>().type.toBe<{ a: string }>();
  expect<Pick<Readonly<Bravo>, "b">>().type.toBe<{ readonly b: number }>();

  expect<Pick<Mutable<Partial<A>>, "a">>().type.toBe<{ a?: string }>();
  expect<Pick<Readonly<Required<B>>, "a">>().type.toBe<{ readonly a: string }>();
});

test("mapping modifiers: optional", () => {
  expect<Partial<A>>().type.toBe<{ readonly a?: string; readonly b?: number }>();
  expect<Partial<A>>().type.not.toBe<{ readonly a?: string | undefined; readonly b?: number | undefined }>();

  expect<Partial<B>>().type.toBe<{ a?: string; b?: number }>();
  expect<Partial<B>>().type.not.toBe<{ a?: string | undefined; b?: number | undefined }>();

  expect<Partial<C>>().type.toBe<{ a?: string; readonly b?: number }>();
  expect<Partial<C>>().type.not.toBe<{ a?: string | undefined; readonly b?: number | undefined }>();

  expect<Required<A>>().type.toBe<{ readonly a: string; readonly b: number }>();
  expect<Required<B>>().type.toBe<{ a: string; b: number }>();
  expect<Required<C>>().type.toBe<{ a: string; readonly b: number }>();

  expect<Simplify<Partial<A>>>().type.toBe<{ readonly a?: string; readonly b?: number }>();
  expect<Simplify<Required<B>>>().type.toBe<{ a: string; b: number }>();

  expect<Pick<Partial<A>, "a">>().type.toBe<{ readonly a?: string }>();
  expect<Pick<Partial<A>, "a">>().type.not.toBe<{ readonly a?: string | undefined }>();
  expect<Pick<Required<B>, "a">>().type.toBe<{ a: string }>();

  expect<Pick<Partial<Alpha>, "a">>().type.toBe<{ readonly a?: string }>();
  expect<Pick<Partial<Alpha>, "a">>().type.not.toBe<{ readonly a?: string | undefined }>();

  expect<Pick<Partial<Bravo>, "a">>().type.toBe<{ readonly a?: string }>();
  expect<Pick<Partial<Bravo>, "a">>().type.not.toBe<{ readonly a?: string | undefined }>();

  expect<Pick<Bravo, "c">>().type.toBe<{ c: boolean }>();
  expect<Pick<Bravo, "c">>().type.not.toBe<{ c: boolean | undefined }>();
  expect<Pick<Partial<Bravo>, "c">>().type.toBe<{ c?: boolean }>();
  expect<Pick<Partial<Bravo>, "c">>().type.not.toBe<{ c?: boolean | undefined }>();
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
