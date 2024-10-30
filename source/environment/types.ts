export interface EnvironmentOptions {
  /**
   * Is `true` if the process is running in continuous integration environment.
   */
  isCi: boolean;
  /**
   * Specifies whether color should be disabled in the output.
   */
  noColor: boolean;
  /**
   * Specifies whether interactive elements should be disabled in the output.
   */
  noInteractive: boolean;
  /**
   * The base URL of the 'npm' registry to use.
   */
  npmRegistry: string;
  /**
   * The directory where to store the 'typescript' packages.
   */
  storePath: string;
  /**
   * The number of seconds to wait before giving up stale operations.
   */
  timeout: number;
  /**
   * The specifier of the TypeScript module.
   */
  typescriptModule: string | undefined;
}
