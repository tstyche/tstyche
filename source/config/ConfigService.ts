import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import type ts from "typescript";
import type { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { StoreService } from "#store";
import { type CommandLineOptions, CommandLineOptionsWorker } from "./CommandLineOptionsWorker.js";
import { type ConfigFileOptions, ConfigFileOptionsWorker } from "./ConfigFileOptionsWorker.js";
import type { OptionValue } from "./OptionDefinitionsMap.js";

export interface ResolvedConfig extends Omit<CommandLineOptions, keyof ConfigFileOptions>, Required<ConfigFileOptions> {
  /**
   * Only run test files with matching path.
   */
  pathMatch: Array<string>;
}

export class ConfigService {
  #commandLineOptions: CommandLineOptions = {};
  #configFileOptions: ConfigFileOptions = {};

  static #defaultOptions: Required<ConfigFileOptions> = {
    failFast: false,
    rootPath: Path.resolve("./"),
    target: [Environment.typescriptPath == null ? "latest" : "current"],
    testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
  };

  #pathMatch: Array<string> = [];
  #storeService: StoreService;

  constructor(
    public compiler: typeof ts,
    storeService: StoreService,
  ) {
    this.#storeService = storeService;
  }

  #onDiagnostic(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostic] }]);
  }

  async parseCommandLine(commandLineArgs: Array<string>): Promise<void> {
    this.#commandLineOptions = {};
    this.#pathMatch = [];

    const commandLineWorker = new CommandLineOptionsWorker(
      this.#commandLineOptions as Record<string, OptionValue>,
      this.#pathMatch,
      this.#storeService,
      this.#onDiagnostic,
    );

    await commandLineWorker.parse(commandLineArgs);
  }

  async readConfigFile(): Promise<void> {
    const configFilePath = this.#commandLineOptions.config ?? Path.resolve("./tstyche.config.json");

    if (!existsSync(configFilePath)) {
      return;
    }

    this.#configFileOptions = {
      rootPath: Path.dirname(configFilePath),
    };

    const configFileText = await fs.readFile(configFilePath, {
      encoding: "utf8",
    });

    const configFileWorker = new ConfigFileOptionsWorker(
      this.compiler,
      this.#configFileOptions as Record<string, OptionValue>,
      configFilePath,
      this.#storeService,
      this.#onDiagnostic,
    );

    await configFileWorker.parse(configFileText);
  }

  resolveConfig(): ResolvedConfig {
    const mergedOptions = {
      ...ConfigService.#defaultOptions,
      ...this.#configFileOptions,
      ...this.#commandLineOptions,
      pathMatch: this.#pathMatch,
    };

    return mergedOptions;
  }
}
