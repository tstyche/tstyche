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

export interface ResolvedConfig
  extends Omit<CommandLineOptions, keyof ConfigFileOptions | "config">,
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

export const defaultOptions: Required<ConfigFileOptions> = {
  failFast: false,
  rootPath: "./",
  target: [Environment.typescriptPath == null ? "latest" : "current"],
  testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
};

export class ConfigService {
  #commandLineOptions: CommandLineOptions = {};
  #compiler: typeof ts;
  #configFileOptions: ConfigFileOptions = {};
  #configFilePath = Path.resolve(defaultOptions.rootPath, "./tstyche.config.json");
  #pathMatch: Array<string> = [];
  #storeService: StoreService;

  constructor(compiler: typeof ts, storeService: StoreService) {
    this.#compiler = compiler;
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

    if (this.#commandLineOptions.config != null) {
      this.#configFilePath = this.#commandLineOptions.config;

      delete this.#commandLineOptions.config;
    }
  }

  async readConfigFile(): Promise<void> {
    this.#configFileOptions = {
      rootPath: Path.dirname(this.#configFilePath),
    };

    if (!existsSync(this.#configFilePath)) {
      return;
    }

    const configFileText = await fs.readFile(this.#configFilePath, {
      encoding: "utf8",
    });

    const configFileWorker = new ConfigFileOptionsWorker(
      this.#compiler,
      this.#configFileOptions as Record<string, OptionValue>,
      this.#configFilePath,
      this.#storeService,
      this.#onDiagnostic,
    );

    await configFileWorker.parse(configFileText);
  }

  resolveConfig(): ResolvedConfig {
    return {
      ...defaultOptions,
      ...this.#configFileOptions,
      ...this.#commandLineOptions,
      configFilePath: this.#configFilePath,
      pathMatch: this.#pathMatch,
    };
  }
}
