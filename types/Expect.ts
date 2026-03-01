interface Matchers {
  /**
   * Checks if the JSX component accepts props of the given type.
   *
   * @remarks
   *
   * This is a work in progress feature. Generic components are not yet supported.
   */
  toAcceptProps: {
    /**
     * Checks if the JSX component accepts props of the given type.
     *
     * @remarks
     *
     * This is a work in progress feature. Generic components are not yet supported.
     */
    <Target>(): void;
    /**
     * Checks if the JSX component accepts the given props.
     *
     * @remarks
     *
     * This is a work in progress feature. Generic components are not yet supported.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the source type is the same as the target type.
   */
  toBe: {
    /**
     * Checks if the source type is the same as the target type.
     */
    <Target>(): void;
    /**
     * Checks if the source type is the same as type of the target expression.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the decorator function can be applied.
   */
  toBeApplicable: (target: unknown, context: DecoratorContext) => void;
  /**
   * Checks if the source type is assignable from the target type.
   */
  toBeAssignableFrom: {
    /**
     * Checks if the source type is assignable from the target type.
     */
    <Target>(): void;
    /**
     * Checks if the source type is assignable from type of the target expression.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the source type is assignable to the target type.
   */
  toBeAssignableTo: {
    /**
     * Checks if the source type is assignable to the target type.
     */
    <Target>(): void;
    /**
     * Checks if the source type is assignable to type of the target expression.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the source type is callable with the given arguments.
   */
  toBeCallableWith: (...args: Array<unknown>) => void;
  /**
   * Checks if the source type is constructable with the given arguments.
   */
  toBeConstructableWith: (...args: Array<unknown>) => void;
  /**
   * Checks if a property key exists on the source type.
   */
  toHaveProperty: (key: string | number | symbol) => void;
  /**
   * Checks if the source type raises an error.
   */
  toRaiseError: (...target: Array<string | number | RegExp>) => void;
}

interface Modifier {
  /**
   * Indicates a type-level assertion.
   */
  type: Matchers & {
    /**
     * Negates the assertion.
     */
    not: Matchers;
  };
}

export interface Expect {
  /**
   * Builds an assertion.
   *
   * @template Source - The type which is checked.
   */
  <Source>(): Modifier;
  /**
   * Builds an assertion.
   *
   * @param source - The expression whose type is checked.
   */
  (source: unknown): Modifier;
  /**
   * Marks an assertion as focused.
   */
  only: {
    /**
     * Marks an assertion as focused.
     *
     * @template Source - The type which is checked.
     */
    <Source>(): Modifier;
    /**
     * Marks an assertion as focused.
     *
     * @param source - The expression whose type is checked.
     */
    (source: unknown): Modifier;
  };
  /**
   * Marks an assertion as skipped.
   */
  skip: {
    /**
     * Marks an assertion as skipped.
     *
     * @template Source - The type which is checked.
     */
    <Source>(): Modifier;
    /**
     * Marks an assertion as skipped.
     *
     * @param source - The expression whose type is checked.
     */
    (source: unknown): Modifier;
  };
}
