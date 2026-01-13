import { expect } from "tstyche";

declare function getIndexOf<T extends string>(target: ReadonlyArray<T>, item: NoInfer<T>): number;

expect(getIndexOf).type.not.toBeCallableWith(
  ["one", "two", "three"],
  // @tstyche cause  Argument of type '"four"' is not assignable to parameter of type '"one" | "two" | "three"'.
  "four",
);

getIndexOf(
  ["one", "two", "three"],
  // @ts-expect-error  Argument of type '"four"' is not assignable to parameter of type '"one" | "two" | "three"'.
  "four",
);
