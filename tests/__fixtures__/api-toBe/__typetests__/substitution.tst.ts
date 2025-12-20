import { expect } from "tstyche";

interface UserProfile {
  age: number | undefined;
  name: string | undefined;
}

type S<T extends string> = T;
type N<T extends number> = T;

type X = <T>() => T extends UserProfile ? (T["name"] extends string ? S<T["name"]> : never) : never;

expect<X>().type.toBe<<T>() => T extends UserProfile ? (T["name"] extends string ? S<T["name"]> : never) : never>();
expect<X>().type.not.toBe<<T>() => T extends UserProfile ? (T["age"] extends number ? N<T["age"]> : never) : never>();
