import { describe, expect, test } from "tstyche";

class Base {
  // ...
}

declare function methodDecorator(
  target: (this: Base, ...args: Array<unknown>) => unknown,
  context: ClassMethodDecoratorContext<Base, (this: Base, ...args: Array<unknown>) => unknown>,
): (this: Base, ...args: Array<unknown>) => unknown;

declare function fieldDecorator<T>(
  target: undefined,
  context: ClassFieldDecoratorContext<T, number>,
): (this: T, value: number) => number;

declare function getterDecorator(
  target: (this: Base) => string,
  context: ClassGetterDecoratorContext<Base, string>,
): ((this: Base) => string) | void;

declare function setterDecorator(
  target: (this: Base, value: string) => void,
  context: ClassSetterDecoratorContext<Base, string>,
): (this: Base, value: string) => void;

describe("source expression", () => {
  test("is applicable to method", () => {
    class Sample extends Base {
      @(expect(methodDecorator).type.toBeApplicable)
      one(): void {
        // ...
      }

      // fail
      @(expect(methodDecorator).type.not.toBeApplicable) two(): void {
        // ...
      }
    }
  });

  test("is NOT applicable to method", () => {
    class Sample extends Base {
      @(expect(fieldDecorator).type.not.toBeApplicable)
      one(): void {
        // ...
      }

      // fail
      @(expect(fieldDecorator).type.toBeApplicable) two(): void {
        // ...
      }
    }
  });

  test("is applicable to field", () => {
    class Sample {
      @(expect(fieldDecorator).type.toBeApplicable)
      one = 1;

      // fail
      @(expect(fieldDecorator).type.not.toBeApplicable) two = 2;
    }
  });

  test("is NOT applicable to field", () => {
    class Sample {
      @(expect(methodDecorator).type.not.toBeApplicable)
      one = 1;

      // fail
      @(expect(methodDecorator).type.toBeApplicable) two = 2;
    }
  });

  test("is applicable to getter", () => {
    class Sample {
      @(expect(getterDecorator).type.toBeApplicable)
      get x() {
        return "sample";
      }

      // fail
      @(expect(getterDecorator).type.not.toBeApplicable) get y() {
        return "sample";
      }
    }
  });

  test("is NOT applicable to getter", () => {
    class Sample {
      @(expect(getterDecorator).type.not.toBeApplicable)
      get x() {
        return true;
      }

      // fail
      @(expect(getterDecorator).type.toBeApplicable) get y() {
        return true;
      }
    }
  });

  test("is applicable to setter", () => {
    class Sample {
      #value = "";

      @(expect(setterDecorator).type.toBeApplicable)
      set x(value: string) {
        this.#value = value;
      }

      // fail
      @(expect(setterDecorator).type.not.toBeApplicable) set y(value: string) {
        this.#value = value;
      }
    }
  });

  test("is NOT applicable to setter", () => {
    class Sample {
      #value = 0;

      @(expect(setterDecorator).type.not.toBeApplicable)
      set x(value: number) {
        this.#value = value;
      }

      // fail
      @(expect(setterDecorator).type.toBeApplicable) set y(value: number) {
        this.#value = value;
      }
    }
  });
});
