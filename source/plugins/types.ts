import type { ResolvedConfig } from "#config";

export interface SelectHookContext {
  resolvedConfig: ResolvedConfig;
}

export interface Plugin {
  name: string;
  config?: (resolvedConfig: ResolvedConfig) => ResolvedConfig | Promise<ResolvedConfig>;
  select?: (this: SelectHookContext, testFiles: Array<string>) => Array<string | URL> | Promise<Array<string | URL>>;
}
