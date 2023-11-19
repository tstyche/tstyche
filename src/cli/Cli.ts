import { TSTyche } from "#api";
import { ConfigService, OptionDefinitionsMap, OptionGroup } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter, type EventHandler } from "#events";
import { Logger } from "#logger";
import { addsPackageStepText, diagnosticText } from "#scribbler";
import { StoreService } from "#store";
import { formattedText } from "./components/formattedText.js";
import { helpText } from "./components/helpText.js";

export class Cli {
  #abortController = new AbortController();
  #logger: Logger;
  #process: NodeJS.Process;
  #storeService: StoreService;

  constructor(process: NodeJS.Process) {
    this.#process = process;

    this.#logger = new Logger();
    this.#storeService = new StoreService();
  }

  #onStartupEvent: EventHandler = ([eventName, payload]) => {
    switch (eventName) {
      case "store:info":
        this.#logger.writeMessage(addsPackageStepText(payload.compilerVersion, payload.installationPath));
        break;

      case "config:error":
      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          switch (diagnostic.category) {
            case DiagnosticCategory.Error:
              this.#abortController.abort();
              this.#process.exitCode = 1;

              this.#logger.writeError(diagnosticText(diagnostic));
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

  async run(commandLineArgs: Array<string>): Promise<void> {
    EventEmitter.addHandler(this.#onStartupEvent);
    await this.#storeService.open(this.#abortController.signal);

    if (this.#process.exitCode === 1) {
      return;
    }

    const compiler = await this.#storeService.load("local", this.#abortController.signal);

    if (!compiler) {
      return;
    }

    // TODO defer validation of --target
    // This would improve performance of --help and would allow to use --cleanup in case if something gets broken with the store
    const configService = new ConfigService(compiler, this.#storeService);

    configService.parseCommandLine(commandLineArgs);

    if (this.#process.exitCode === 1) {
      return;
    }

    if (configService.commandLineOptions.prune === true) {
      await this.#storeService.prune();

      return;
    }

    if (configService.commandLineOptions.help === true) {
      const commandLineOptionDefinitions = OptionDefinitionsMap.for(OptionGroup.CommandLine);

      this.#logger.writeMessage(helpText(commandLineOptionDefinitions, TSTyche.version));

      return;
    }

    if (configService.commandLineOptions.update === true) {
      await this.#storeService.update();

      return;
    }

    if (configService.commandLineOptions.version === true) {
      this.#logger.writeMessage(formattedText(TSTyche.version));

      return;
    }

    await configService.readConfigFile();

    if (this.#process.exitCode === 1) {
      return;
    }

    const resolvedConfig = configService.resolveConfig();

    if (configService.commandLineOptions.showConfig === true) {
      this.#logger.writeMessage(
        formattedText({
          noColor: Environment.noColor,
          storePath: Environment.storePath,
          timeout: Environment.timeout,
          ...resolvedConfig,
        }),
      );

      return;
    }

    if (configService.commandLineOptions.install === true) {
      for (const tag of resolvedConfig.target) {
        await this.#storeService.install(tag, this.#abortController.signal);
      }

      return;
    }

    const testFiles = configService.selectTestFiles();

    if (this.#process.exitCode === 1) {
      return;
    }

    if (configService.commandLineOptions.listFiles === true) {
      this.#logger.writeMessage(formattedText(testFiles));

      return;
    }

    EventEmitter.removeHandler(this.#onStartupEvent);

    const tstyche = new TSTyche(resolvedConfig, this.#storeService);

    await tstyche.run(testFiles);
  }
}
