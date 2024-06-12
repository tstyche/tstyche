import { expect, test } from "tstyche";

type MethodLike = (...args: any) => any;

type MethodLikeKeys<T> = keyof {
  [K in keyof T as Required<T>[K] extends MethodLike ? K : never]: T[K];
};

interface Sample {
  description: string;
  getLength: () => number;
  getWidth?: () => number;
}

test("MethodLikeKeys", () => {
  expect<MethodLikeKeys<Sample>>().type.toBe<"getLength" | "getWidth">();
});
