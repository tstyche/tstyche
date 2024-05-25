import fs from "node:fs/promises";
import { TSTyche } from "#api";
import { ConfigService, OptionDefinitionsMap, OptionGroup } from "#config";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { CancellationHandler, ExitCodeHandler, SetupReporter } from "#handlers";
import { OutputService, formattedText, helpText } from "#output";
import { SelectService } from "#select";
import { StoreService } from "#store";
import { CancellationReason, CancellationToken } from "#token";

export class Cli {
  #eventEmitter = new EventEmitter();
  #outputService = new OutputService();
  #storeService = new StoreService();

  async run(commandLineArguments: Array<string>, cancellationToken = new CancellationToken()): Promise<void> {
    this.#eventEmitter.addHandler(new ExitCodeHandler());

    const setupReporter = new SetupReporter(this.#outputService);
    this.#eventEmitter.addHandler(setupReporter);

    const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.ConfigError);
    this.#eventEmitter.addHandler(cancellationHandler);

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

    this.#eventEmitter.removeHandler(setupReporter);
    this.#eventEmitter.removeHandler(cancellationHandler);

    const tstyche = new TSTyche(resolvedConfig, this.#outputService, selectService, this.#storeService);

    await tstyche.run(testFiles, cancellationToken);
    tstyche.close();

    this.#eventEmitter.removeHandlers();
  }
}
