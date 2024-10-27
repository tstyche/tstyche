import type { ResolvedConfig } from "#config";

export interface Plugin extends Hooks {
  /**
   * The name of this plugin.
   */
  name: string;
}

export interface Hooks {
  /**
   * Is called after configuration is resolved and allows to modify it.
   */
  config?: (resolvedConfig: ResolvedConfig) => ResolvedConfig | Promise<ResolvedConfig>;
  /**
   * Is called after test files are selected and allows to modify the list.
   */
  select?: (testFiles: Array<string>) => Array<string | URL> | Promise<Array<string | URL>>;
}
