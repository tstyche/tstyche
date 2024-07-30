import { expect } from "tstyche";

function firstItem<T>(target: Array<T>): T | undefined {
  return target[0];
}

expect(firstItem(["a", "b"])).type.toBe<string | undefined>();

expect(firstItem([1, 2, 3])).type.toBe<number | undefined>();

expect(firstItem()).type.toRaiseError("Expected 1 argument");
