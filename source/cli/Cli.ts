import { TSTyche } from "#api";
import { ConfigService, OptionDefinitionsMap, OptionGroup, type ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { CancellationHandler, ExitCodeHandler, SetupReporter } from "#handlers";
import { OutputService, formattedText, helpText, waitingForFileChangesText } from "#output";
import { SelectService } from "#select";
import { StoreService } from "#store";
import { CancellationReason, CancellationToken } from "#token";
import { FileWatcher, type WatchHandler, Watcher } from "#watch";

export class Cli {
  #eventEmitter = new EventEmitter();
  #outputService = new OutputService();

  async run(commandLineArguments: Array<string>, cancellationToken = new CancellationToken()): Promise<void> {
    const exitCodeHandler = new ExitCodeHandler();
    this.#eventEmitter.addHandler(exitCodeHandler);

    const setupReporter = new SetupReporter(this.#outputService);
    this.#eventEmitter.addHandler(setupReporter);

    const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.ConfigError);
    this.#eventEmitter.addHandler(cancellationHandler);

    if (commandLineArguments.includes("--help")) {
      const commandLineOptionDefinitions = OptionDefinitionsMap.for(OptionGroup.CommandLine);

      this.#outputService.writeMessage(helpText(commandLineOptionDefinitions, TSTyche.version));

      return;
    }

    if (commandLineArguments.includes("--version")) {
      this.#outputService.writeMessage(formattedText(TSTyche.version));

      return;
    }

    const storeService = new StoreService();

    if (commandLineArguments.includes("--prune")) {
      await storeService.prune();

      return;
    }

    if (commandLineArguments.includes("--update")) {
      await storeService.update();

      return;
    }

    const configService = new ConfigService();

    await configService.parseCommandLine(commandLineArguments, storeService);

    if (cancellationToken.isCancellationRequested) {
      return;
    }

    do {
      if (cancellationToken.reason === CancellationReason.ConfigChange) {
        cancellationToken.reset();
        exitCodeHandler.resetCode();

        this.#outputService.clearTerminal();

        this.#eventEmitter.addHandler(setupReporter);
        this.#eventEmitter.addHandler(cancellationHandler);
      }

      await configService.readConfigFile(storeService);

      const resolvedConfig = configService.resolveConfig();

      if (cancellationToken.isCancellationRequested) {
        if (commandLineArguments.includes("--watch")) {
          await this.#waitForChangedFiles(resolvedConfig, /* selectService */ undefined, cancellationToken);
        }
        continue;
      }

      if (commandLineArguments.includes("--showConfig")) {
        this.#outputService.writeMessage(formattedText({ ...resolvedConfig }));
        continue;
      }

      if (commandLineArguments.includes("--install")) {
        for (const tag of resolvedConfig.target) {
          await storeService.install(tag);
        }
        continue;
      }

      const selectService = new SelectService(resolvedConfig);
      let testFiles: Array<string> = [];

      if (resolvedConfig.testFileMatch.length !== 0) {
        testFiles = await selectService.selectFiles();

        if (testFiles.length === 0) {
          if (commandLineArguments.includes("--watch")) {
            await this.#waitForChangedFiles(resolvedConfig, selectService, cancellationToken);
          }
          continue;
        }

        if (commandLineArguments.includes("--listFiles")) {
          this.#outputService.writeMessage(formattedText(testFiles));
          continue;
        }
      }

      this.#eventEmitter.removeHandler(setupReporter);
      this.#eventEmitter.removeHandler(cancellationHandler);

      const tstyche = new TSTyche(resolvedConfig, this.#outputService, selectService, storeService);

      await tstyche.run(testFiles, cancellationToken);
      tstyche.close();
    } while (cancellationToken.reason === CancellationReason.ConfigChange);

    this.#eventEmitter.removeHandlers();
  }

  #waitForChangedFiles(
    resolvedConfig: ResolvedConfig,
    selectService: SelectService | undefined,
    cancellationToken: CancellationToken,
  ) {
    return new Promise<void>((resolve) => {
      const watchers: Array<Watcher> = [];

      cancellationToken.reset();

      this.#outputService.writeMessage(waitingForFileChangesText());

      const onChanged = () => {
        cancellationToken.cancel(CancellationReason.ConfigChange);

        for (const watcher of watchers) {
          watcher.close();
        }

        resolve();
      };

      watchers.push(new FileWatcher(resolvedConfig.configFilePath, onChanged));

      if (selectService != null) {
        const onChangedTestFile: WatchHandler = (filePath) => {
          if (selectService.isTestFile(filePath)) {
            onChanged();
          }
        };

        const onRemoved: WatchHandler = () => {
          // do nothing, only added files are important
        };

        watchers.push(new Watcher(resolvedConfig.rootPath, onChangedTestFile, onRemoved, { recursive: true }));
      }

      for (const watcher of watchers) {
        watcher.watch();
      }
    });
  }
}
