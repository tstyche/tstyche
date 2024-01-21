/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-extraneous-class */

import { expect } from "tstyche";

class Base extends HTMLElement {
  foo() {
    // skipped
  }
}

function sample<Class extends new (...args: any) => Base>(target: Class, context: ClassDecoratorContext<Class>) {
  return class DecoratedClass extends target {};
}

(
  @expect(sample).type.toBeApplicable
  class extends Base {}
);

(
  @expect(sample).type.not.toBeApplicable
  class {}
);
(
  @expect(sample).type.not.toBeApplicable
  class extends HTMLElement {}
);

@expect(sample).type.not.toBeApplicable
abstract class Test extends Base {}

/// /// /// /// ///

function bind<This, Value extends (this: This, ...args: any) => any>(
  value: Value,
  context: ClassMethodDecoratorContext<This, Value>,
) {
  // skipped
}

function addOne<T>(target: undefined, context: ClassFieldDecoratorContext<T, number>) {
  return function (this: T, value: number) {
    return value + 1;
  };
}

class Fixture {
  @expect(addOne).type.toBeApplicable
  count = 2;

  @expect(addOne).type.not.toBeApplicable
  #name: string;
  constructor(name: string) {
    this.#name = name;
  }

  @expect(bind).type.toBeApplicable
  @expect(addOne).type.not.toBeApplicable
  toString() {
    return `Fixture(${this.#name})`;
  }
}
