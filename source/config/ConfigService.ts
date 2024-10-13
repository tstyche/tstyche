import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { type Diagnostic, SourceFile } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { StoreService } from "#store";
import { CommandLineOptionsWorker } from "./CommandLineOptionsWorker.js";
import { ConfigFileOptionsWorker } from "./ConfigFileOptionsWorker.js";
import { defaultOptions } from "./defaultOptions.js";
import { environmentOptions } from "./environmentOptions.js";
import type { CommandLineOptions, ConfigFileOptions, EnvironmentOptions, OptionValue } from "./types.js";

export interface ResolvedConfig
  extends EnvironmentOptions,
    Omit<CommandLineOptions, keyof ConfigFileOptions | "config">,
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

export class ConfigService {
  #commandLineOptions: CommandLineOptions = {};
  #configFileOptions: ConfigFileOptions = {};
  #configFilePath = Path.resolve(defaultOptions.rootPath, "./tstyche.config.json");
  #pathMatch: Array<string> = [];

  #onDiagnostics(this: void, diagnostics: Diagnostic) {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostics] }]);
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

    const sourceFile = new SourceFile(this.#configFilePath, configFileText);

    const configFileWorker = new ConfigFileOptionsWorker(
      this.#configFileOptions as Record<string, OptionValue>,
      sourceFile,
      storeService,
      this.#onDiagnostics,
    );

    await configFileWorker.parse();
  }

  // TODO take 'userOptions: Partial<ResolvedConfig>' and spread it as last one.
  //      (can be used in 'integration-Runner.test.js')
  resolveConfig(): ResolvedConfig {
    return {
      ...defaultOptions,
      ...environmentOptions,
      ...this.#configFileOptions,
      ...this.#commandLineOptions,
      configFilePath: this.#configFilePath,
      pathMatch: this.#pathMatch,
    };
  }
}
