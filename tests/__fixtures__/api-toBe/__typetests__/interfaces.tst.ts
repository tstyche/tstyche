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
  }

  interface Bravo<K, V> {
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
