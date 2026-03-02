interface Matchers {
  /**
   * Checks if the type is the same as the given type.
   */
  toBe: {
    /**
     * Checks if the type is the same as the given type.
     */
    <Target>(): void;
    /**
     * Checks if the type is the same as type of the given expression.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the type is assignable from the given type.
   */
  toBeAssignableFrom: {
    /**
     * Checks if the type is assignable from the given type.
     */
    <Target>(): void;
    /**
     * Checks if the type is assignable from type of the given expression.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the type is assignable to the given type.
   */
  toBeAssignableTo: {
    /**
     * Checks if the type is assignable to the given type.
     */
    <Target>(): void;
    /**
     * Checks if the type is assignable to type of the given expression.
     */
    (target: unknown): void;
  };
}

interface Matchers {
  /**
   * Checks if the JSX component accepts the given props.
   */
  toAcceptProps: {
    /**
     * Checks if the JSX component accepts props of the given type.
     */
    <Target>(): void;
    /**
     * Checks if the JSX component accepts the given props.
     */
    (target: unknown): void;
  };
  /**
   * Checks if the decorator is applicable to the given class or class member.
   */
  toBeApplicable: (target: unknown, context: DecoratorContext) => void;
  /**
   * Checks if the function is callable with the given arguments.
   */
  toBeCallableWith: (...args: Array<unknown>) => void;
  /**
   * Checks if the class is constructable with the given arguments.
   */
  toBeConstructableWith: (...args: Array<unknown>) => void;
  /**
   * Checks if the generic is instantiable with the given type arguments.
   */
  toBeInstantiableWith: <Target extends [...args: Array<unknown>]>() => void;
  /**
   * Checks if the type has the given property.
   */
  toHaveProperty: (key: string | number | symbol) => void;
  /**
   * Checks if the type raises an error.
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
