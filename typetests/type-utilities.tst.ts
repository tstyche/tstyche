import { describe, expect, omit, pick, test } from "tstyche";

class Queue<T> {
  entries: Array<T> = [];

  get size(): number {
    return this.entries.length;
  }

  enqueue(item: T): void {
    this.entries.push(item);
  }
}

describe("type utilities", () => {
  test("'omit()'", () => {
    expect(omit).type.toBeCallableWith(new Queue(), "size");
    expect(omit).type.toBeCallableWith(new Queue(), "enqueue", "entries");

    expect(omit).type.not.toBeCallableWith();
    expect(omit).type.not.toBeCallableWith(new Queue());
  });

  test("'pick()'", () => {
    expect(pick).type.toBeCallableWith(new Queue(), "size");
    expect(pick).type.toBeCallableWith(new Queue(), "enqueue", "entries");

    expect(pick).type.not.toBeCallableWith();
    expect(pick).type.not.toBeCallableWith(new Queue());
    expect(pick).type.not.toBeCallableWith(new Queue(), "dispose");
  });
});
