import { expect } from "tstyche";

declare function getIndexOf<T extends string>(target: Array<T>, item: NoInfer<T>): number;

expect(getIndexOf).type.not.toBeCallableWith(
  ["apple", "pear"],
  // @tstyche cause  Argument of type '"lemon"' is not assignable to parameter of type '"apple" | "pear"'.
  "lemon",
);

const colors = ["red", "green"] as const;

expect(getIndexOf).type.not.toBeCallableWith(
  // @tstyche cause  The type 'readonly ["red", "green"]' ... cannot be assigned to the mutable type 'string[]'.
  colors,
  "green",
);
