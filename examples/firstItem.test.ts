import { expect, test } from "tstyche";

function firstItem<T>(target: Array<T>): T | undefined {
  return target[0];
}

test("firstItem", () => {
  expect(firstItem(["a", "b", "c"])).type.toEqual<string | undefined>();
  expect(firstItem([1, 2, 3])).type.toEqual<number | undefined>();

  expect(firstItem).type.not.toBeCallableWith();
  expect.fail(firstItem).type.not.toBeCallableWith(["a", 1]);
});
