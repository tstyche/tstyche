import type { CommandLineOptions } from "../../models/CommandLineOptions.js";
import type { ConfigFileOptions } from "../../models/ConfigFileOptions.js";

export type { ConfigFileOptions } from "../../models/ConfigFileOptions.js";
export type { CommandLineOptions } from "../../models/CommandLineOptions.js";

export type OptionValue = Array<OptionValue> | string | number | boolean | null | undefined;

export interface InlineConfig {
  if?: { target?: Array<string> };
  template?: boolean;
}

export interface ResolvedConfig
  extends Omit<CommandLineOptions, "config" | keyof ConfigFileOptions>,
    Required<ConfigFileOptions> {
  /**
   * The path to a TSTyche configuration file.
   */
  configFilePath: string;
  /**
   * Only run test files with matching path.
   */
  pathMatch: Array<string>;
}
