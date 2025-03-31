import type { ResolvedConfig } from "#config";

export interface SelectHookContext {
  resolvedConfig: ResolvedConfig;
}

export interface Plugin {
  /**
   * The name of this plugin.
   */
  name: string;
  /**
   * Is called after configuration is resolved and allows to modify it.
   */
  config?: (resolvedConfig: ResolvedConfig) => ResolvedConfig | Promise<ResolvedConfig>;
  /**
   * Is called after test files are selected and allows to modify the list.
   */
  select?: (this: SelectHookContext, testFiles: Array<string>) => Array<string | URL> | Promise<Array<string | URL>>;
}
