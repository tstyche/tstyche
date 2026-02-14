import { expect } from "tstyche";

declare function getIndexOf<T extends string>(target: Array<T>, item: NoInfer<T>): number;

expect(getIndexOf).type.not.toBeCallableWith(
  ["apple", "pear"],
  // @tstyche cause  Argument of type '"lemon"' is not assignable to parameter of type '"apple" | "pear"'.
  "lemon",
);

const fruits = ["apple", "pear"] as const;

expect(getIndexOf).type.not.toBeCallableWith(
  // If 'NoInfer' marker is removed from the signature, only the above assertion would fail.
  // This assertion would pass with or without 'NoInfer', due to 'fruits' being of an incompatible type.
  fruits,
  "lemon",
);
