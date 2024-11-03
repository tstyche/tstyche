import { expect, omit, pick } from "tstyche";

class Queue<T> {
  entries: Array<T> = [];

  get size(): number {
    return this.entries.length;
  }

  enqueue(item: T): void {
    this.entries.push(item);
  }
}

expect(omit(new Queue(), "enqueue", "entries")).type.toBe<{
  readonly size: number;
}>();

// Equivalent to the 'Omit' utility type
expect<Omit<Queue<string>, "enqueue" | "entries">>().type.toBe<{
  readonly size: number;
}>();

expect(pick(new Queue(), "size")).type.toBe<{ readonly size: number }>();

// Equivalent to the 'Pick' utility type
expect<Pick<Queue<string>, "size">>().type.toBe<{ readonly size: number }>();
