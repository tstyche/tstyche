import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import type { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { JsonScanner, JsonSourceFile } from "#json";
import { Path } from "#path";
import { CommandParser } from "./CommandParser.js";
import { ConfigParser } from "./ConfigParser.js";
import { defaultOptions } from "./defaultOptions.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { Options } from "./Options.js";
import { Target } from "./Target.js";
import type { CommandLineOptions, ConfigFileOptions, OptionValue, ResolvedConfig, TaskOptions } from "./types.js";

export class Config {
  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostic] }]);
  }

  static async parseCommandLine(
    commandLine: ReadonlyArray<string>,
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
    configPath?: string | undefined,
    rootPath?: string | undefined,
  ): Promise<{ configFileOptions: ConfigFileOptions }> {
    const configFileOptions: ConfigFileOptions = {};
    const configFilePath = Config.resolveConfigFilePath(configPath, rootPath);

    if (existsSync(configFilePath)) {
      const configFileText = await fs.readFile(configFilePath, {
        encoding: "utf8",
      });

      const sourceFile = new JsonSourceFile(configFilePath, configFileText);

      const configFileParser = new ConfigParser(
        configFileOptions as Record<string, OptionValue>,
        OptionGroup.ConfigFile,
        sourceFile,
        new JsonScanner(sourceFile),
        Config.#onDiagnostics,
      );

      await configFileParser.parse();
    }

    return { configFileOptions };
  }

  static resolve(options?: {
    configFileOptions?: ConfigFileOptions;
    commandLineOptions?: CommandLineOptions;
    pathMatch?: Array<string>;
  }): ResolvedConfig {
    const resolvedConfig = {
      configFilePath: Config.resolveConfigFilePath(
        options?.commandLineOptions?.config,
        options?.commandLineOptions?.root,
      ),
      pathMatch: options?.pathMatch ?? [],
      rootPath: Config.resolveRootPath(options?.commandLineOptions?.root),
      ...defaultOptions,
      ...options?.configFileOptions,
      ...options?.commandLineOptions,
    };

    if ("config" in resolvedConfig) {
      delete resolvedConfig.config;
    }
    if ("root" in resolvedConfig) {
      delete resolvedConfig.root;
    }

    return resolvedConfig;
  }

  static resolveConfigFilePath(configPath?: string | undefined, rootPath?: string | undefined): string {
    return configPath != null
      ? Path.resolve(configPath)
      : Path.resolve(Config.resolveRootPath(rootPath), "./tstyche.json");
  }

  static resolveRootPath(rootPath?: string | undefined): string {
    return Path.resolve(rootPath ?? ".");
  }

  static async resolveTask(taskOptions: TaskOptions, resolvedConfig: ResolvedConfig): Promise<ResolvedConfig> {
    const resolvedTask: Record<string, unknown> = {};

    for (const key in taskOptions) {
      const optionValue = taskOptions[key as keyof TaskOptions];

      if (optionValue != null) {
        switch (key) {
          case "checkDeclarationFiles":
          case "checkSuppressedErrors":
          case "compilerOptions":
            resolvedTask[key] = optionValue;
            break;

          case "target":
            await Options.validate("target", optionValue as string, Config.#onDiagnostics);

            resolvedTask[key] = await Target.expand(optionValue as string, Config.#onDiagnostics);
            break;

          case "tsconfig":
            await Options.validate("tsconfig", optionValue as string, Config.#onDiagnostics);

            resolvedTask[key] = Options.resolve("tsconfig", optionValue as string);
            break;
        }
      }
    }

    return { ...resolvedConfig, ...resolvedTask };
  }
}
