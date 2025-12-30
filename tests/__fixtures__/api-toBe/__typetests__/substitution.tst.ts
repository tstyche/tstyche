import { expect } from "tstyche";

interface UserProfile {
  age: number | undefined;
  name: string | undefined;
}

type S<T extends string> = T;
type N<T extends number> = T;

type A = <T>() => T extends UserProfile ? (T["name"] extends string ? S<T["name"]> : never) : never;
type B = <T>() => T extends UserProfile ? (T["age"] extends number ? N<T["age"]> : never) : never;

expect<A>().type.toBe<<T>() => T extends UserProfile ? (T["name"] extends string ? S<T["name"]> : never) : never>();
expect<A>().type.not.toBe<<T>() => T extends UserProfile ? (T["name"] extends string ? string : never) : never>();

expect<B>().type.toBe<<T>() => T extends UserProfile ? (T["age"] extends number ? N<T["age"]> : never) : never>();
expect<B>().type.not.toBe<<T>() => T extends UserProfile ? (T["age"] extends number ? number : never) : never>();

expect<A>().type.not.toBe<B>();
expect<B>().type.not.toBe<A>();
