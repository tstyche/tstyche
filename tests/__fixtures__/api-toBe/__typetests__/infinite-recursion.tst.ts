import { expect } from "tstyche";

export type ReadonlyCollection<Value> = Omit<Collection<Value>, "tap">;

export declare class Collection<Value> {
  tap(fn: (collection: this) => void): this;
  union<OtherValue>(other: ReadonlyCollection<OtherValue>): Collection<OtherValue | Value>;
}

expect<ReadonlyCollection<{}>>().type.not.toBe<ReadonlyCollection<{ x: string }>>();
expect<ReadonlyCollection<{}>>().type.toBe<ReadonlyCollection<{ x: string }>>(); // fail

type Box<T> = {
  value: T;
};

expect<Box<Box<Box<string>>>>().type.not.toBe<Box<Box<Box<number>>>>();
expect<Box<Box<Box<string>>>>().type.toBe<Box<Box<Box<number>>>>(); // fail
