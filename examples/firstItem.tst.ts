import { expect } from "tstyche";

function firstItem<T>(target: Array<T>): T | undefined {
  return target[0];
}

expect(firstItem(["a", "b"])).type.toEqual<string | undefined>();

expect(firstItem([1, 2, 3])).type.toEqual<number | undefined>();

expect(firstItem()).type.toRaiseError("Expected 1 argument");
