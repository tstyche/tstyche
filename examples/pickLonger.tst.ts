import { expect, test } from "tstyche";

function pickLonger<T extends { length: number }>(a: T, b: T) {
  return a.length >= b.length ? a : b;
}

test("pickLonger()", () => {
  expect(pickLonger([1, 2], [1, 2, 3])).type.toBe<Array<number>>();
  expect(pickLonger("two", "three")).type.toBe<"two" | "three">();

  expect(pickLonger).type.not.toBeCallableWith(1, 2);

  expect(pickLonger).type.not.toBeCallableWith("zero", [123]);
  expect(pickLonger<string | Array<number>>).type.toBeCallableWith("zero", [123]);
});
