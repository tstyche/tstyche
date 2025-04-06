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
});
