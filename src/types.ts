interface Describe {
  /**
   * Defines a group of tests.
   *
   * @param name - The name of the group.
   * @param callback - The function to create a scope for a group of tests.
   */
  (name: string, callback: () => void | Promise<void>): void;
  /**
   * Marks a group of tests as focused.
   *
   * @param name - The name of the group.
   * @param callback - The function to create a scope for a group of tests.
   */
  only: (name: string, callback: () => void | Promise<void>) => void;
  /**
   * Marks a group of tests as skipped.
   *
   * @param name - The name of the group.
   * @param callback - The function to create a scope for a group of tests.
   */
  skip: (name: string, callback: () => void | Promise<void>) => void;
  /**
   * Marks a group of tests as yet to be implemented.
   *
   * @param name - The name of the group.
   * @param callback - The function to create a scope for a group of tests.
   */
  todo: (name: string, callback?: () => void | Promise<void>) => void;
}

interface Test {
  /**
   * Defines a single test.
   *
   * @param name - The name of the test.
   * @param callback - The function with a code snippet and assertions.
   */
  (name: string, callback: () => void | Promise<void>): void;
  /**
   * Marks a test as focused.
   *
   * @param name - The name of the test.
   * @param callback - The function with a code snippet and assertions.
   */
  only: (name: string, callback: () => void | Promise<void>) => void;
  /**
   * Marks a test as skipped.
   *
   * @param name - The name of the test.
   * @param callback - The function with a code snippet and assertions.
   */
  skip: (name: string, callback: () => void | Promise<void>) => void;
  /**
   * Marks a test as yet to be implemented.
   *
   * @param name - The name of the test.
   * @param callback - The function with a code snippet and assertions.
   */
  todo: (name: string, callback?: () => void | Promise<void>) => void;
}

interface Matchers {
  /**
   * Checks if the `any` type is identical to the source type.
   */
  toBeAny: () => void;
  /**
   * Checks if the source decorator function can be applied to the target class or class member.
   */
  toBeApplicable: (target: unknown, context: DecoratorContext) => void;
  /**
   * Checks if the target type is assignable to the source type.
   */
  toBeAssignable: {
    /**
     * Checks if the target type is assignable to the source type.
     */
    <Target>(): void;
    /**
     * Checks if type of the target expression is assignable to the source type.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the `bigint` type is identical to the source type.
   */
  toBeBigInt: () => void;
  /**
   * Checks if the `boolean` type is identical to the source type.
   */
  toBeBoolean: () => void;
  /**
   * Checks if the `never` type is identical to the source type.
   */
  toBeNever: () => void;
  /**
   * Checks if the `null` type is identical to the source type.
   */
  toBeNull: () => void;
  /**
   * Checks if the `number` type is identical to the source type.
   */
  toBeNumber: () => void;
  /**
   * Checks if the `string` type is identical to the source type.
   */
  toBeString: () => void;
  /**
   * Checks if the `symbol` type is identical to the source type.
   */
  toBeSymbol: () => void;
  /**
   * Checks if the `undefined` type is identical to the source type.
   */
  toBeUndefined: () => void;
  /**
   * Checks if the `unique symbol` type is identical to the source type.
   */
  toBeUniqueSymbol: () => void;
  /**
   * Checks if the `unknown` type is identical to the source type.
   */
  toBeUnknown: () => void;
  /**
   * Checks if the `void` type is identical to the source type.
   */
  toBeVoid: () => void;
  /**
   * Check if the target type is identical to the source type.
   */
  toEqual: {
    /**
     * Checks if the target type is identical to the source type.
     */
    <Target>(): void;
    /**
     * Checks if type of the target expression is identical to the source type.
     */
    (target: unknown): void;
  };
  /**
   * Checks if a property key exists on the source type.
   */
  toHaveProperty: (key: string | number | symbol) => void;
  /**
   * Checks if the target type is a subtype the source type.
   */
  toMatch: {
    /**
     * Checks if the target type is a subtype the source type.
     */
    <Target>(): void;
    /**
     * Checks if type of the target expression is a subtype the source type.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the source type raises an error.
   */
  toRaiseError: (...target: Array<string | number>) => void;
}

interface Modifier {
  /**
   * Passes the source type to the matcher.
   */
  type: Matchers & {
    /**
     * Negates the assertion.
     */
    not: Matchers;
  };
}

interface Expect {
  /**
   * Builds an assertion.
   *
   * @typeParam Source - The type against which the assertion will be made.
   */
  <Source>(): Modifier;
  /**
   * Builds an assertion.
   *
   * @param source - The expression against which type the assertion will be made.
   */
  (source: unknown): Modifier;
  fail: {
    /**
     * Mark an assertion as supposed to fail.
     *
     * @typeParam Source - The type against which the assertion will be made.
     */
    <Source>(): Modifier;
    /**
     * Mark an assertion as supposed to fail.
     *
     * @param source - The expression against which type the assertion will be made.
     */
    (source: unknown): Modifier;
  };
  /**
   * Marks an assertion as focused.
   */
  only: {
    /**
     * Marks an assertion as focused.
     *
     * @typeParam Source - The type against which the assertion will be made.
     */
    <Source>(): Modifier;
    /**
     * Marks an assertion as focused.
     *
     * @param source - The expression against which type the assertion will be made.
     */
    (source: unknown): Modifier;
    fail: {
      /**
       * Mark an assertion as supposed to fail.
       *
       * @typeParam Source - The type against which the assertion will be made.
       */
      <Source>(): Modifier;
      /**
       * Mark an assertion as supposed to fail.
       *
       * @param source - The expression against which type the assertion will be made.
       */
      (source: unknown): Modifier;
    };
  };
  /**
   * Marks an assertion as skipped.
   */
  skip: {
    /**
     * Marks an assertion as skipped.
     *
     * @typeParam Source - The type against which the assertion will be made.
     */
    <Source>(): Modifier;
    /**
     * Marks an assertion as skipped.
     *
     * @param source - The expression against which type the assertion will be made.
     */
    (source: unknown): Modifier;
    fail: {
      /**
       * Marks an assertion as supposed to fail.
       *
       * @typeParam Source - The type against which the assertion will be made.
       */
      <Source>(): Modifier;
      /**
       * Marks an assertion as supposed to fail.
       *
       * @param source - The expression against which type the assertion will be made.
       */
      (source: unknown): Modifier;
    };
  };
}

/**
 * Defines a test group.
 */
export declare const describe: Describe;
/**
 * Defines a single test.
 */
export declare const test: Test;
/**
 * Defines a single test.
 */
export declare const it: Test;
/**
 * Builds an assertion.
 */
export declare const expect: Expect;
