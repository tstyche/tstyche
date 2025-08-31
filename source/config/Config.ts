import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import type { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { JsonScanner } from "#json";
import { Path } from "#path";
import { SourceFile } from "#source";
import { CommandParser } from "./CommandParser.js";
import { ConfigParser } from "./ConfigParser.js";
import { defaultOptions } from "./defaultOptions.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import type { CommandLineOptions, ConfigFileOptions, OptionValue, ResolvedConfig } from "./types.js";

export class Config {
  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostic] }]);
  }

  static async parseCommandLine(
    commandLine: Array<string>,
  ): Promise<{ commandLineOptions: CommandLineOptions; pathMatch: Array<string> }> {
    const commandLineOptions: CommandLineOptions = {};
    const pathMatch: Array<string> = [];

    const commandLineParser = new CommandParser(
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

      const configFileParser = new ConfigParser(
        configFileOptions as Record<string, OptionValue>,
        OptionGroup.ConfigFile,
        sourceFile,
        new JsonScanner(sourceFile),
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
      delete resolvedConfig.config;
    }

    return resolvedConfig;
  }

  static resolveConfigFilePath(filePath?: string): string {
    return filePath != null ? Path.resolve(filePath) : Path.resolve("./tstyche.config.json");
  }
}
