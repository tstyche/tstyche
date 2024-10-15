import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { type Diagnostic, SourceFile } from "#diagnostic";
import { type EnvironmentOptions, environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { CommandLineParser } from "./CommandLineParser.js";
import { ConfigFileParser } from "./ConfigFileParser.js";
import { defaultOptions } from "./defaultOptions.js";
import type { CommandLineOptions, ConfigFileOptions, OptionValue } from "./types.js";

export interface ResolvedConfig
  extends EnvironmentOptions,
    Omit<CommandLineOptions, "config" | keyof ConfigFileOptions>,
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

export class Config {
  static #onDiagnostics(this: void, diagnostics: Diagnostic) {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostics] }]);
  }

  static async parseCommandLine(
    commandLine: Array<string>,
  ): Promise<{ commandLineOptions: CommandLineOptions; pathMatch: Array<string> }> {
    const commandLineOptions: CommandLineOptions = {};
    const pathMatch: Array<string> = [];

    const commandLineParser = new CommandLineParser(
      commandLineOptions as Record<string, OptionValue>,
      pathMatch,
      Config.#onDiagnostics,
    );

    await commandLineParser.parse(commandLine);

    return { commandLineOptions, pathMatch };
  }

  static async parseConfigFile(
    filePath?: string,
  ): Promise<{ configFileOptions: ConfigFileOptions; configFilePath: string }> {
    const configFilePath = Config.resolveConfigFilePath(filePath);

    const configFileOptions: ConfigFileOptions = {
      rootPath: Path.dirname(configFilePath),
    };

    if (existsSync(configFilePath)) {
      const configFileText = await fs.readFile(configFilePath, {
        encoding: "utf8",
      });

      const sourceFile = new SourceFile(configFilePath, configFileText);

      const configFileParser = new ConfigFileParser(
        configFileOptions as Record<string, OptionValue>,
        sourceFile,
        Config.#onDiagnostics,
      );

      await configFileParser.parse();
    }

    return { configFileOptions, configFilePath };
  }

  static resolve(options?: {
    configFileOptions?: ConfigFileOptions;
    configFilePath?: string;
    commandLineOptions?: Omit<CommandLineOptions, "config">;
    pathMatch?: Array<string>;
  }): ResolvedConfig {
    const resolvedConfig = {
      configFilePath: Config.resolveConfigFilePath(options?.configFilePath),
      pathMatch: options?.pathMatch ?? [],
      ...defaultOptions,
      ...environmentOptions,
      ...options?.configFileOptions,
      ...options?.commandLineOptions,
    };

    if ("config" in resolvedConfig) {
      // biome-ignore lint/performance/noDelete: must clean up
      delete resolvedConfig.config;
    }

    return resolvedConfig;
  }

  static resolveConfigFilePath(filePath?: string) {
    return filePath != null ? Path.resolve(filePath) : Path.resolve("./tstyche.config.json");
  }
}
