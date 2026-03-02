import type { Describe } from "./Describe.js";
import type { Expect } from "./Expect.js";
import type { Test } from "./Test.js";
import type { When } from "./When.js";

/**
 * The fill-in type. Useful to fill in the required type arguments of generic types.
 */
export type _ = never;
/**
 * Builds an assertion.
 */
export declare const expect: Expect;
/**
 * Reshapes type of the given object by removing the specified keys.
 */
export declare function omit<T, K extends PropertyKey>(object: T, ...keys: [K, ...Array<K>]): Omit<T, K>;
/**
 * Reshapes type of the given object by keeping only the specified keys.
 */
export declare function pick<T, K extends keyof T>(object: T, ...keys: [K, ...Array<K>]): Pick<T, K>;
/**
 * Defines a test group.
 */
export declare const describe: Describe;
/**
 * Defines a single test.
 */
export declare const it: Test;
/**
 * Defines a single test.
 */
export declare const test: Test;
/**
 * Creates a test plan.
 */
export declare const when: When;
