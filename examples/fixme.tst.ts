import { expect, it } from "tstyche";

declare function test(cb: () => unknown): void;
declare function test(cb: () => Promise<unknown>): Promise<void>;

expect(test(() => {})).type.toBe<void>();
// @tstyche fixme -- This should work, see: #265
expect(test(() => Promise.resolve())).type.toBe<Promise<void>>();

it("() => unknown", () => {
  expect(test(() => {})).type.toBe<void>();
});
//@tstyche fixme -- This should work, see: #265
it("() => Promise<unknown>", () => {
  expect(test(() => Promise.resolve())).type.toBe<Promise<void>>();
});
