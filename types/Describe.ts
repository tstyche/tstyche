export interface Describe {
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
