interface Actions {
  /**
   * Calls the given function with the provided arguments.
   */
  isCalledWith: (...args: Array<unknown>) => void;
}

export interface When {
  /**
   * Creates a test plan.
   *
   * @template Target - The type upon which an action is performed.
   */
  <Target>(): Actions;
  /**
   * Creates a test plan.
   *
   * @param target - The expression upon which an action is performed.
   */
  (target: unknown): Actions;
}
