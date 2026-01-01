import { expect, test } from "tstyche";

test("edge cases", () => {
  expect<(...args: Array<any>) => void>().type.toBe<(...args: any) => void>();
});

test("parameter arity", () => {
  expect<() => void>().type.toBe<() => void>();
  expect<() => void>().type.not.toBe<(x: string) => void>();

  expect<(x: string) => void>().type.toBe<(x: string) => void>();
  expect<(x: string) => void>().type.not.toBe<() => void>();

  expect<(x: string) => void>().type.toBe<(x: string) => void>();
  expect<(x: string) => void>().type.not.toBe<(x: string, y: number) => void>();

  expect<(x: string, y: number) => void>().type.toBe<(x: string, y: number) => void>();
  expect<(x: string, y: number) => void>().type.not.toBe<(x: string) => void>();

  expect<(x: string) => void>().type.not.toBe<(x: string, y?: number) => void>();
  expect<(x: string, y?: number) => void>().type.not.toBe<(x: string) => void>();
});

test("parameter type", () => {
  expect<(x: string) => void>().type.toBe<(x: string) => void>();
  expect<(x: string) => void>().type.not.toBe<(x: number) => void>();

  expect<(x: string, y: number) => void>().type.toBe<(x: string, y: number) => void>();
  expect<(x: string, y: number) => void>().type.not.toBe<(x: string, y: string) => void>();

  expect<(x: string, y?: number) => void>().type.toBe<(x: string, y?: number) => void>();
  expect<(x: string, y?: number) => void>().type.not.toBe<(x: string, y?: string) => void>();
});

test("optional parameter", () => {
  expect<(x?: string) => void>().type.toBe<(x?: string) => void>();

  expect<() => void>().type.not.toBe<(x?: string) => void>();
  expect<(x?: string) => void>().type.not.toBe<() => void>();

  expect<(x: string, y?: number) => void>().type.toBe<(x: string, y?: number) => void>();

  expect<(x: string, y: number) => void>().type.not.toBe<(x: string, y?: number) => void>();
  expect<(x: string, y?: number) => void>().type.not.toBe<(x: string, y: number) => void>();

  expect<(x: string) => void>().type.not.toBe<(x: string, y?: number) => void>();
  expect<(x: string, y?: number) => void>().type.not.toBe<(x: string) => void>();
});

test("default value", () => {
  function withDefault(x: string, y: boolean | undefined = true): void {
    //...
  }

  expect(withDefault).type.toBe<(x: string, y?: boolean | undefined) => void>();
  expect(withDefault).type.not.toBe<(x: string, y: boolean | undefined) => void>();
});

test("rest parameter", () => {
  expect<(...args: Array<number>) => number>().type.toBe<(...args: Array<number>) => number>();
  expect<(...args: Array<number>) => number>().type.not.toBe<(args: Array<number>) => number>();

  expect<(x: string, ...rest: Array<boolean>) => void>().type.toBe<(x: string, ...rest: Array<boolean>) => void>();
  expect<(x: string, ...rest: Array<boolean>) => void>().type.not.toBe<(x: string, rest: Array<boolean>) => void>();

  expect<(a: unknown, b: string, c: number) => void>().type.toBe<
    (a: unknown, ...rest: [b: string, c: number]) => void
  >();
  expect<(a: unknown, b: string, c: number) => void>().type.not.toBe<
    (a: unknown, rest: [b: string, c: number]) => void
  >();

  expect<(a: unknown, b: string, c?: number) => void>().type.toBe<
    (a: unknown, ...rest: [b: string, c?: number]) => void
  >();
  expect<(a: unknown, b: string, c?: number) => void>().type.not.toBe<
    (a: unknown, ...rest: [b: string, c: number]) => void
  >();

  expect<(a: unknown, b: string, ...c: Array<number>) => void>().type.toBe<
    (a: unknown, ...rest: [b: string, ...c: Array<number>]) => void
  >();
  expect<(a: unknown, b: string, ...c: Array<number>) => void>().type.not.toBe<
    (a: unknown, ...rest: [b: string, c: Array<number>]) => void
  >();

  expect<(x: string, ...rest: [number, ...Array<string>, ...[boolean]]) => void>().type.toBe<
    (x: string, y: number, ...rest: [...Array<string>, boolean]) => void
  >();
  expect<(x: string, ...rest: [number, ...Array<string>, ...[boolean]]) => void>().type.not.toBe<
    (x: string, y: number, ...rest: [...Array<string>, Array<boolean>]) => void
  >();
});

test("generic type parameters", () => {
  expect<<T>(a: T) => T>().type.toBe<<T>(a: T) => T>();
  expect<<T, U>(a: T, b: U) => [T, U]>().type.toBe<<T, U>(a: T, b: U) => [T, U]>();

  function firstElement<T>(array: Array<T>): T | undefined {
    return array.at(0);
  }
  function lastElement<T>(array: Array<T>): T | undefined {
    return array.at(-1);
  }

  expect(firstElement).type.toBe(lastElement);
  expect(firstElement).type.toBe<<T>(a: Array<T>) => T | undefined>();
  expect(firstElement).type.not.toBe<<T>(a: Array<T>) => T>();
  expect(firstElement).type.not.toBe<<T>(a: Array<T>) => undefined>();

  function map<T, U>(x: Array<T>, f: (a: T) => U): Array<U> {
    return x.map(f);
  }
  function nap<T, U>(x: Array<T>, f: (a: T) => U): Array<U> {
    return x.map(f);
  }

  expect(map).type.toBe(nap);
  expect(map).type.toBe<<T, U>(x: Array<T>, f: (a: T) => U) => Array<U>>();
  expect(map).type.not.toBe<<T, U>(x: Array<T>, f: (a: T) => U) => U>();
  expect(map).type.not.toBe<<T, U>(x: Array<T>, f: (a: T) => U) => Array<unknown>>();

  function longest<T extends { length: number }>(a: T, b: T) {
    if (a.length >= b.length) {
      return a;
    }
    return b;
  }
  function shortest<T extends { length: number }>(a: T, b: T) {
    if (a.length <= b.length) {
      return a;
    }
    return b;
  }

  expect(longest).type.toBe(shortest);
  expect(longest).type.toBe<<T extends { length: number }>(a: T, b: T) => T>();
  expect(longest).type.not.toBe<<T extends number>(a: T, b: T) => T>();

  function withDefault<T = string>(value: T): T {
    return value;
  }

  expect(withDefault).type.toBe<<T = string>(value: T) => T>();
  expect(withDefault).type.not.toBe<<T = number>(value: T) => T>();
  expect(withDefault).type.not.toBe<<T = string>(value: T) => string>();
});

test("'const' type parameters", () => {
  function getNames<T extends { names: ReadonlyArray<string> }>(arg: T): T["names"] {
    return arg.names;
  }

  function getNamesExactly<const T extends { names: ReadonlyArray<string> }>(arg: T): T["names"] {
    return arg.names;
  }

  expect(getNames({ names: ["Alice", "Bob", "Eve"] })).type.toBe<Array<string>>();
  expect(getNames({ names: ["Alice", "Bob", "Eve"] })).type.not.toBe<readonly ["Alice", "Bob", "Eve"]>();

  expect(getNamesExactly({ names: ["Alice", "Bob", "Eve"] })).type.toBe<readonly ["Alice", "Bob", "Eve"]>();
  expect(getNamesExactly({ names: ["Alice", "Bob", "Eve"] })).type.not.toBe<Array<string>>();

  expect(getNames).type.toBe<<T extends { names: ReadonlyArray<string> }>(arg: T) => T["names"]>();
  expect(getNames).type.not.toBe<<const T extends { names: ReadonlyArray<string> }>(arg: T) => T["names"]>();

  expect(getNamesExactly).type.toBe<<const T extends { names: ReadonlyArray<string> }>(arg: T) => T["names"]>();
  expect(getNamesExactly).type.not.toBe<<T extends { names: ReadonlyArray<string> }>(arg: T) => T["names"]>();

  expect(getNames).type.not.toBe(getNamesExactly);
});

test("overloads", () => {
  type Sample = {
    (x: string): string;
    (y: number): number;
  };

  expect<Sample>().type.toBe<{
    (x: string): string;
    (y: number): number;
  }>();

  expect<Sample>().type.not.toBe<{
    (y: number): number;
    (x: string): string;
  }>();

  expect<Sample>().type.not.toBe<(x: string) => string>();

  expect<Sample>().type.not.toBe<{
    (x: string): string;
    (y: number): number;
    (z: boolean): boolean;
  }>();
});

test("index signatures", () => {
  interface StringArray {
    [key: number]: string;
  }

  interface ReadonlyStringArray {
    readonly [key: number]: string;
  }

  expect<StringArray>().type.toBe<{ [key: number]: string }>();
  expect<StringArray>().type.not.toBe<{ [key: string]: string }>();
  expect<StringArray>().type.not.toBe<{ [key: number]: number }>();
  expect<StringArray>().type.not.toBe<{ readonly [key: number]: string }>();

  expect<ReadonlyStringArray>().type.toBe<{ readonly [key: number]: string }>();
  expect<ReadonlyStringArray>().type.not.toBe<{ readonly [key: string]: string }>();
  expect<ReadonlyStringArray>().type.not.toBe<{ readonly [key: number]: number }>();
  expect<ReadonlyStringArray>().type.not.toBe<{ [key: number]: string }>();
});

test("'Record' signatures", () => {
  expect<Record<string, number>>().type.toBe<{ [key: string]: number }>();
  expect<Record<`id-${string}`, boolean>>().type.toBe<{ [key: `id-${string}`]: boolean }>();

  expect<{ [key: string]: number }>().type.toBe<Record<string, number>>();
  expect<{ [key: `id-${string}`]: boolean }>().type.toBe<Record<`id-${string}`, boolean>>();

  expect<Record<string, number | string> & { a: number }>().type.toBe<{
    [key: string]: number | string;
    a: number;
  }>();
  expect<Record<string, number | string> & { a: number }>().type.not.toBe<{
    [key: string]: number | string;
    a: string;
  }>();
});

test("'this' parameter", () => {
  expect<(this: void, a: number) => void>().type.toBe<(this: void, a: number) => void>();
  expect<(this: void, a: number) => void>().type.not.toBe<(this: never, a: number) => void>();
  expect<(this: void, a: number) => void>().type.not.toBe<(a: number) => void>();

  expect<<T>(this: T, a: number) => void>().type.toBe<<T>(this: T, a: number) => void>();
  expect<<T>(this: T, a: number) => void>().type.not.toBe<(this: unknown, a: number) => void>();

  expect<{
    (this: void, x: string): string;
    (y: number): number;
  }>().type.toBe<{
    (this: void, x: string): string;
    (y: number): number;
  }>();
  expect<{
    (this: void, x: string): string;
    (y: number): number;
  }>().type.not.toBe<{
    (x: string): string;
    (y: number): number;
  }>();
});

test("async function", () => {
  expect<(x: string) => Promise<string>>().type.toBe<(x: string) => Promise<string>>();
  expect<(x: string) => Promise<string>>().type.not.toBe<(x: string) => string>();

  expect<() => AsyncGenerator<number, void, unknown>>().type.toBe<() => AsyncGenerator<number, void, unknown>>();
  expect<() => AsyncGenerator<number, void, unknown>>().type.not.toBe<() => Promise<number>>();
});

test("return type", () => {
  type A = () => void;
  type B = <T>() => T;
  type C = (a: number) => (b: string) => boolean;
  type D = <T extends [number, number]>(a: T) => T[number];

  expect<A>().type.toBe<() => void>();
  expect<A>().type.not.toBe<() => never>();

  expect<B>().type.toBe<<T>() => T>();
  expect<B>().type.not.toBe<() => unknown>();

  expect<C>().type.toBe<(a: number) => (b: string) => boolean>();
  expect<C>().type.not.toBe<(a: number) => (b: string) => void>();
  expect<C>().type.not.toBe<(a: number) => () => boolean>();

  expect<D>().type.toBe<<T extends [number, number]>(a: T) => T[number]>();
  expect<D>().type.not.toBe<<T extends [number, number]>(a: T) => Array<number>[number]>();
  expect<D>().type.not.toBe<<T extends [number, number]>(a: T) => T[0 | 1]>();
  expect<D>().type.not.toBe<<T extends [number, number]>(a: T) => T>();
  expect<D>().type.not.toBe<<T extends [number, number]>(a: T) => number>();
});

test("property function signature", () => {
  type Sample = {
    increment(x: string): string;
    reset?: () => void;
  };

  expect<Sample>().type.toBe<{
    increment(x: string): string;
    reset?: () => void;
  }>();
  expect<Sample>().type.toBe<{
    increment: (x: string) => string;
    reset?(): void;
  }>();

  expect<Sample>().type.not.toBe<{
    increment(x: number): number;
    reset?: () => void;
  }>();
  expect<Sample>().type.not.toBe<{
    increment(x: number): number;
    reset?: () => Promise<void>;
  }>();
  expect<Sample>().type.not.toBe<{
    increment(x: number): number;
  }>();
  expect<Sample>().type.not.toBe<{
    reset?: () => Promise<void>;
  }>();
});

test("additional properties", () => {
  interface Sample {
    (x: string): number;
    name: string;
    meta?: any;
  }

  expect<Sample>().type.toBe<{
    (x: string): number;
    name: string;
    meta?: any;
  }>();
  expect<Sample>().type.not.toBe<{
    (x: string): void;
    name: string;
    meta?: any;
  }>();
  expect<Sample>().type.not.toBe<{
    (x: string): number;
    name: string;
  }>();
});
