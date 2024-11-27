import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { type Diagnostic, SourceFile } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { Store } from "#store";
import { CommandLineParser } from "./CommandLineParser.js";
import { ConfigFileParser } from "./ConfigFileParser.js";
import { Target } from "./Target.js";
import { defaultOptions } from "./defaultOptions.js";
import type { CommandLineOptions, ConfigFileOptions, OptionValue } from "./types.js";

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

export class Config {
  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostic] }]);
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
      ...options?.configFileOptions,
      ...options?.commandLineOptions,
    };

    if ("config" in resolvedConfig) {
      // biome-ignore lint/performance/noDelete: must clean up
      delete resolvedConfig.config;
    }

    // TODO consider adding 'minorVersions' as a property to 'manifest' in TSTyche 4
    const minorVersions = Object.keys(Store.manifest?.resolutions ?? []).slice(0, -4);

    // resolving earlier is less performant, because configuration file options are overridden
    resolvedConfig.target = Target.resolve(resolvedConfig.target, minorVersions);

    return resolvedConfig;
  }

  static resolveConfigFilePath(filePath?: string) {
    return filePath != null ? Path.resolve(filePath) : Path.resolve("./tstyche.config.json");
  }
}
