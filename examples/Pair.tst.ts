import { expect, test } from "tstyche";

class Pair<T> {
  left: T;
  right: T;

  constructor(left: T, right: T) {
    this.left = left;
    this.right = right;
  }
}

test("Pair", () => {
  expect(Pair).type.toBeConstructableWith("sun", "moon");
  expect(Pair).type.toBeConstructableWith(true, false);

  expect(Pair).type.not.toBeConstructableWith("five", 10);
  expect(Pair<number | string>).type.toBeConstructableWith("five", 10);

  expect(Pair).type.not.toBeConstructableWith();
  expect(Pair).type.not.toBeConstructableWith("nope");
});
