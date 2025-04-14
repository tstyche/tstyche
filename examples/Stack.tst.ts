import { expect, test } from "tstyche";

class Stack<T> {
  #elements: Array<T> = [];
  #size: number;

  constructor(size: number) {
    this.#size = size;
  }

  push(element: T): void {
    if (this.#elements.length === this.#size) {
      throw new Error("The stack is overflow!");
    }

    this.#elements.push(element);
  }

  pop(): T | undefined {
    if (this.#elements.length === 0) {
      throw new Error("The stack is empty!");
    }

    return this.#elements.pop();
  }
}

test("Stack", () => {
  expect(Stack).type.toBeConstructableWith(10);

  expect(Stack).type.not.toBeConstructableWith();
});
