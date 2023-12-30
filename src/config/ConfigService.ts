import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
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
    rootPath: "./",
    target: ["latest"],
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

  parseCommandLine(commandLineArgs: Array<string>): void {
    this.#commandLineOptions = {};
    this.#pathMatch = [];

    const commandLineWorker = new CommandLineOptionsWorker(
      this.#commandLineOptions as Record<string, OptionValue>,
      this.#pathMatch,
      this.#storeService,
      this.#onDiagnostic,
    );

    commandLineWorker.parse(commandLineArgs);
  }

  async readConfigFile(
    filePath?: string, // TODO take URL as well
    sourceText?: string,
  ): Promise<void> {
    const configFilePath = filePath ?? this.#commandLineOptions.config ?? Path.resolve("./tstyche.config.json");

    this.#configFileOptions = {
      rootPath: Path.dirname(configFilePath),
    };

    let configFileText = sourceText ?? "";

    if (sourceText == null && existsSync(configFilePath)) {
      configFileText = await fs.readFile(configFilePath, {
        encoding: "utf8",
      });
    }

    const configFileWorker = new ConfigFileOptionsWorker(
      this.compiler,
      this.#configFileOptions as Record<string, OptionValue>,
      configFilePath,
      this.#storeService,
      this.#onDiagnostic,
    );

    await configFileWorker.parse(configFileText);
  }

  // TODO could take 'configFileOptions: ConfigFileOptions' and add them on top of everything for programmatic usage
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
