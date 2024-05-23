import fs from "node:fs/promises";
import process from "node:process";
import { TSTyche } from "#api";
import { ConfigService, OptionDefinitionsMap, OptionGroup } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter, type EventHandler } from "#events";
import { OutputService, addsPackageStepText, diagnosticText, formattedText, helpText } from "#output";
import { SelectService } from "#select";
import { StoreService } from "#store";
import { CancellationReason, CancellationToken } from "#token";

export class Cli {
  #outputService: OutputService;
  #storeService: StoreService;

  constructor() {
    this.#outputService = new OutputService();
    this.#storeService = new StoreService();
  }

  async run(commandLineArguments: Array<string>, cancellationToken = new CancellationToken()): Promise<void> {
    const setupReporter: EventHandler = ([eventName, payload]) => {
      switch (eventName) {
        case "store:info": {
          this.#outputService.writeMessage(addsPackageStepText(payload.compilerVersion, payload.installationPath));
          break;
        }

        case "config:error":
        case "select:error":
        case "store:error": {
          for (const diagnostic of payload.diagnostics) {
            switch (diagnostic.category) {
              case DiagnosticCategory.Error: {
                cancellationToken.cancel(CancellationReason.ConfigError);
                this.#outputService.writeError(diagnosticText(diagnostic));

                process.exitCode = 1;
                break;
              }

              case DiagnosticCategory.Warning: {
                this.#outputService.writeWarning(diagnosticText(diagnostic));
                break;
              }
            }
          }
          break;
        }

        default:
          break;
      }
    };

    EventEmitter.addHandler(setupReporter);

    if (commandLineArguments.includes("--help")) {
      const commandLineOptionDefinitions = OptionDefinitionsMap.for(OptionGroup.CommandLine);

      this.#outputService.writeMessage(helpText(commandLineOptionDefinitions, TSTyche.version));

      return;
    }

    if (commandLineArguments.includes("--prune")) {
      await fs.rm(Environment.storePath, { force: true, recursive: true });

      return;
    }

    if (commandLineArguments.includes("--version")) {
      this.#outputService.writeMessage(formattedText(TSTyche.version));

      return;
    }

    if (commandLineArguments.includes("--update")) {
      await this.#storeService.update();

      return;
    }

    const compiler = await this.#storeService.load(Environment.typescriptPath == null ? "latest" : "current");

    if (!compiler) {
      return;
    }

    const configService = new ConfigService(compiler, this.#storeService);

    await configService.parseCommandLine(commandLineArguments);

    if (cancellationToken.isCancellationRequested) {
      return;
    }

    await configService.readConfigFile();

    if (cancellationToken.isCancellationRequested) {
      return;
    }

    const resolvedConfig = configService.resolveConfig();

    if (commandLineArguments.includes("--showConfig")) {
      this.#outputService.writeMessage(
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
        this.#outputService.writeMessage(formattedText(testFiles));

        return;
      }
    }

    EventEmitter.removeHandler(setupReporter);

    const tstyche = new TSTyche(resolvedConfig, selectService, this.#storeService);

    await tstyche.run(testFiles, cancellationToken);
  }
}
