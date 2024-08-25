import { existsSync } from "node:fs";
import fs from "node:fs/promises";
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
  rootPath: Path.resolve("./"),
  target: Environment.typescriptPath != null ? ["current"] : ["latest"],
  testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
};

export class ConfigService {
  #commandLineOptions: CommandLineOptions = {};
  #configFileOptions: ConfigFileOptions = {};
  #configFilePath = Path.resolve(defaultOptions.rootPath, "./tstyche.config.json");
  #pathMatch: Array<string> = [];

  #onDiagnostics(this: void, diagnostics: Diagnostic | Array<Diagnostic>) {
    EventEmitter.dispatch(["config:error", { diagnostics: Array.isArray(diagnostics) ? diagnostics : [diagnostics] }]);
  }

  async parseCommandLine(commandLineArgs: Array<string>, storeService: StoreService): Promise<void> {
    this.#commandLineOptions = {};
    this.#pathMatch = [];

    const commandLineWorker = new CommandLineOptionsWorker(
      this.#commandLineOptions as Record<string, OptionValue>,
      this.#pathMatch,
      storeService,
      this.#onDiagnostics,
    );

    await commandLineWorker.parse(commandLineArgs);

    if (this.#commandLineOptions.config != null) {
      this.#configFilePath = this.#commandLineOptions.config;

      delete this.#commandLineOptions.config;
    }
  }

  async readConfigFile(storeService: StoreService): Promise<void> {
    this.#configFileOptions = {
      rootPath: Path.dirname(this.#configFilePath),
    };

    if (!existsSync(this.#configFilePath)) {
      return;
    }

    const configFileText = await fs.readFile(this.#configFilePath, {
      encoding: "utf8",
    });

    const compiler = await storeService.load(Environment.typescriptPath != null ? "current" : "latest");

    if (!compiler) {
      return;
    }

    const configFileWorker = new ConfigFileOptionsWorker(
      compiler,
      this.#configFileOptions as Record<string, OptionValue>,
      this.#configFilePath,
      storeService,
      this.#onDiagnostics,
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
