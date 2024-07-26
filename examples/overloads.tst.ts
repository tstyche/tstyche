import { expect } from "tstyche";

declare function test(cb: () => Promise<unknown>): Promise<void>;
declare function test(cb: () => unknown): void;

expect(test(() => {})).type.toBe<void>();
expect(test(() => Promise.resolve())).type.toBe<Promise<void>>();
