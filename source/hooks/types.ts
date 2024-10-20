import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import type { MemoryFiles } from "#fs";

export interface Hooks {
  /**
   * Is called after configuration is resolved and allows to modify it.
   */
  config?: (resolvedConfig: ResolvedConfig) => ResolvedConfig | Promise<ResolvedConfig>;
  /**
   * Is called before a project is created and allows to modify its host.
   */
  project?: (memoryFiles: MemoryFiles, compiler: typeof ts) => MemoryFiles | Promise<MemoryFiles>;
  /**
   * Is called after test files are selected and allows to modify the list.
   */
  select?: (testFiles: Array<string>) => Array<string | URL> | Promise<Array<string | URL>>;
}
