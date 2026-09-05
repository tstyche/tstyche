import { expect } from "tstyche";

export type ReadonlyCollection<Value> = Omit<Collection<Value>, "tap">;

export declare class Collection<Value> {
  tap(fn: (collection: this) => void): this;
  union<OtherValue>(other: ReadonlyCollection<OtherValue>): Collection<OtherValue | Value>;
}

expect<ReadonlyCollection<{}>>().type.not.toBe<ReadonlyCollection<{ x: string }>>();
