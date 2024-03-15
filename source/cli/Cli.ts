import fs from "node:fs/promises";
import process from "node:process";
import { TSTyche } from "#api";
import { ConfigService, OptionDefinitionsMap, OptionGroup } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter, type EventHandler } from "#events";
import { Logger } from "#logger";
import { addsPackageStepText, diagnosticText, formattedText, helpText } from "#output";
import { SelectService } from "#select";
import { StoreService } from "#store";
import { CancellationToken } from "#token";

export class Cli {
  #cancellationToken = new CancellationToken();
  #logger: Logger;
  #storeService: StoreService;

  constructor() {
    this.#logger = new Logger();
    this.#storeService = new StoreService();
  }

  #onStartupEvent: EventHandler = ([eventName, payload]) => {
    switch (eventName) {
      case "store:info":
        this.#logger.writeMessage(addsPackageStepText(payload.compilerVersion, payload.installationPath));
        break;

      case "config:error":
      case "select:error":
      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          switch (diagnostic.category) {
            case DiagnosticCategory.Error:
              this.#cancellationToken.cancel();
              this.#logger.writeError(diagnosticText(diagnostic));

              process.exitCode = 1;
              break;

            case DiagnosticCategory.Warning:
              this.#logger.writeWarning(diagnosticText(diagnostic));
              break;
          }
        }
        break;

      default:
        break;
    }
  };

  async run(commandLineArguments: Array<string>): Promise<void> {
    EventEmitter.addHandler(this.#onStartupEvent);

    if (commandLineArguments.includes("--help")) {
      const commandLineOptionDefinitions = OptionDefinitionsMap.for(OptionGroup.CommandLine);

      this.#logger.writeMessage(helpText(commandLineOptionDefinitions, TSTyche.version));

      return;
    }

    if (commandLineArguments.includes("--prune")) {
      await fs.rm(Environment.storePath, { force: true, recursive: true });

      return;
    }

    if (commandLineArguments.includes("--version")) {
      this.#logger.writeMessage(formattedText(TSTyche.version));

      return;
    }

    if (commandLineArguments.includes("--update")) {
      await this.#storeService.update();

      return;
    }

    const compiler = await this.#storeService.load(
      Environment.typescriptPath == null ? "latest" : "current",
    );

    if (!compiler) {
      return;
    }

    const configService = new ConfigService(compiler, this.#storeService);

    await configService.parseCommandLine(commandLineArguments);

    if (this.#cancellationToken.isCancellationRequested) {
      return;
    }

    await configService.readConfigFile();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.#cancellationToken.isCancellationRequested) {
      return;
    }

    const resolvedConfig = configService.resolveConfig();

    if (commandLineArguments.includes("--showConfig")) {
      this.#logger.writeMessage(
        formattedText({
          noColor: Environment.noColor,
          noInteractive: Environment.noInteractive,
          storePath: Environment.storePath,
          timeout: Environment.timeout,
          typescriptPath: Environment.typescriptPath,
          ...resolvedConfig,
        }),
      );

      return;
    }

    if (commandLineArguments.includes("--install")) {
      for (const tag of resolvedConfig.target) {
        await this.#storeService.install(tag);
      }

      return;
    }

    const selectService = new SelectService(resolvedConfig);
    let testFiles: Array<string> = [];

    if (resolvedConfig.testFileMatch.length !== 0) {
      testFiles = await selectService.selectFiles();

      if (testFiles.length === 0) {
        return;
      }

      if (commandLineArguments.includes("--listFiles")) {
        this.#logger.writeMessage(formattedText(testFiles));

        return;
      }
    }

    EventEmitter.removeHandler(this.#onStartupEvent);

    const tstyche = new TSTyche(resolvedConfig, this.#storeService);

    await tstyche.run(testFiles);
  }
}
