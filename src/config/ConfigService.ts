import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
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
    allowNoTestFiles: false,
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

  get commandLineOptions(): CommandLineOptions {
    return this.#commandLineOptions;
  }

  get configFileOptions(): ConfigFileOptions {
    return this.#configFileOptions;
  }

  static get defaultOptions(): Required<ConfigFileOptions> {
    return ConfigService.#defaultOptions;
  }

  #onDiagnostic = (diagnostic: Diagnostic) => {
    EventEmitter.dispatch(["config:error", { diagnostics: [diagnostic] }]);
  };

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

  selectTestFiles(): Array<string> {
    const { allowNoTestFiles, pathMatch, rootPath, testFileMatch } = this.resolveConfig();

    let testFilePaths = this.compiler.sys.readDirectory(
      rootPath,
      /* extensions */ undefined,
      /* exclude */ undefined,
      /* include */ testFileMatch,
    );

    if (pathMatch.length > 0) {
      testFilePaths = testFilePaths.filter((testFilePath) =>
        pathMatch.some((match) => {
          const relativeTestFilePath = Path.relative("", testFilePath);

          return relativeTestFilePath.toLowerCase().includes(match.toLowerCase());
        }),
      );
    }

    if (testFilePaths.length === 0 && !allowNoTestFiles) {
      const text = [
        "No test files were selected using current configuration.",
        `Root path:       ${rootPath}`,
        `Test file match: ${testFileMatch.join(", ")}`,
      ];

      if (pathMatch.length > 0) {
        text.push(`Path match:      ${pathMatch.join(", ")}`);
      }

      this.#onDiagnostic(Diagnostic.error(text));
    }

    return testFilePaths;
  }
}
