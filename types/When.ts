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
   * @deprecated This API is planned to be removed. For a replacement, see https://tstyche.org/guides/expect-errors.
   */
  <T>(): Actions;
  /**
   * Creates a test plan.
   *
   * @deprecated This API is planned to be removed. For a replacement, see https://tstyche.org/guides/expect-errors.
   */
  (target: unknown): Actions;
}
