import type { Diagnostic } from "#diagnostic";

export type { ConfigFileOptions } from "../../models/ConfigFileOptions.js";

export type { CommandLineOptions } from "../../models/CommandLineOptions.js";

export type DiagnosticsHandler = (diagnostics: Diagnostic | Array<Diagnostic>) => void;

export interface EnvironmentOptions {
  /**
   * Is `true` if the process is running in a continuous integration environment.
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
   * The path to the currently installed TypeScript module.
   */
  typescriptPath: string | undefined;
}

export type OptionValue = Array<OptionValue> | string | number | boolean | null | undefined;
