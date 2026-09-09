import { expect, test } from "tstyche";

test("edge cases", () => {
  interface A {
    a: unknown;
  }
  type B<T = unknown> = {
    a: T;
  };
  interface C<T = number> {
    a: T;
  }

  expect<A>().type.toBe<B>();
  expect<A>().type.toBe<C<unknown>>();
  expect<A>().type.not.toBe<C>();

  expect<B<number>>().type.toBe<C>();
  expect<B>().type.toBe<C<unknown>>();
  expect<B<string>>().type.toBe<C<string>>();

  expect<C<unknown>>().type.toBe<B>();
  expect<C>().type.toBe<B<number>>();
  expect<C<string>>().type.toBe<B<string>>();
});

test("recursive types", () => {
  interface Alpha<K, V> {
    // biome-ignore lint/style/useNamingConvention: test
    merge<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Alpha<K | KC, Exclude<V, VC> | VC>;
    merge<C>(...collections: Array<{ [key: string]: C }>): Alpha<K | string, Exclude<V, C> | C>;

    sort(comparator?: (value: V) => boolean): this & Bravo<K, V>;
    sortBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number,
    ): this & Bravo<K, V>;
  }

  interface Bravo<K, V> extends Alpha<K, V> {
    // biome-ignore lint/style/useNamingConvention: test
    merge<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Bravo<K | KC, Exclude<V, VC> | VC>;
    merge<C>(...collections: Array<{ [key: string]: C }>): Bravo<K | string, Exclude<V, C> | C>;
  }

  expect<Alpha<string, string>>().type.toBe<Bravo<string, string>>();
  expect<Bravo<string, string>>().type.toBe<Alpha<string, string>>();

  expect<Alpha<string, number>>().type.toBe<Bravo<string, number>>();
  expect<Bravo<string, number>>().type.toBe<Alpha<string, number>>();

  expect<Alpha<string, string>>().type.not.toBe<Bravo<string, number>>();
  expect<Bravo<string, string>>().type.not.toBe<Alpha<string, number>>();
});

test("unused type parameters", () => {
  // biome-ignore lint/suspicious/noEmptyInterface: test
  interface A<T> {}
  // biome-ignore lint/suspicious/noEmptyInterface: test
  interface B {}
  interface C<T, U = boolean> {
    x: T;
  }

  class Alpha<T> {}
  class Bravo {}
  class Charlie<T, U = boolean> extends Alpha<T> {
    x: T | undefined;
  }

  expect<A<string>>().type.toBe<{}>();
  expect<{}>().type.toBe<A<number>>();

  expect<A<A<A<string>>>>().type.toBe<{}>();
  expect<{}>().type.toBe<A<A<A<number>>>>();

  expect<A<string>>().type.toBe<A<number>>();
  expect<A<number>>().type.toBe<A<string>>();

  expect<A<string>>().type.not.toBe<C<string>>();
  expect<C<string>>().type.not.toBe<A<string>>();

  expect<B>().type.toBe<{}>();
  expect<B>().type.toBe<A<string>>();
  expect<B>().type.toBe<A<A<A<string>>>>();
  expect<B>().type.not.toBe<C<string>>();

  expect<C<string>>().type.not.toBe<C<number>>();
  expect<C<number>>().type.not.toBe<C<string>>();

  expect<C<number, true>>().type.toBe<C<number>>();
  expect<C<number>>().type.toBe<C<number, false>>();

  expect<Alpha<string>>().type.toBe<{}>();
  expect<{}>().type.toBe<Alpha<number>>();

  expect<Alpha<Alpha<Alpha<string>>>>().type.toBe<{}>();
  expect<{}>().type.toBe<Alpha<Alpha<Alpha<number>>>>();

  expect<Alpha<string>>().type.toBe<Alpha<number>>();
  expect<Alpha<number>>().type.toBe<Alpha<string>>();

  expect<Alpha<string>>().type.not.toBe<Charlie<string>>();
  expect<Alpha<number>>().type.not.toBe<Charlie<number>>();

  expect<Bravo>().type.toBe<{}>();
  expect<Bravo>().type.toBe<Alpha<string>>();
  expect<Bravo>().type.toBe<Alpha<Alpha<Alpha<string>>>>();
  expect<Bravo>().type.not.toBe<Charlie<string>>();

  expect<Charlie<string>>().type.not.toBe<Charlie<number>>();
  expect<Charlie<number>>().type.not.toBe<Charlie<string>>();

  expect<Charlie<number, true>>().type.toBe<Charlie<number>>();
  expect<Charlie<number>>().type.toBe<Charlie<number, false>>();
});
