import { expect } from "tstyche";

function bind<This, Value extends (this: This, ...args: any) => any>(
  _target: Value,
  _context: ClassMethodDecoratorContext<This, Value>,
) {
  // skipped
}

export class Person {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  @(expect(bind).type.toBeApplicable)
  toString() {
    return `Hello, my name is ${this.#name}.`;
  }
}
