interface Actions {
  /**
   * Calls the given function with the provided arguments.
   */
  isCalledWith: (...args: Array<unknown>) => void;
}

export interface When {
  /**
   * Creates a test plan.
   */
  <T>(): Actions;
  /**
   * Creates a test plan.
   */
  (target: unknown): Actions;
}
