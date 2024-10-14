import { ConfigService, OptionDefinitionsMap, OptionGroup, type ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { CancellationHandler, ExitCodeHandler } from "#handlers";
import { type Hooks, HooksService } from "#hooks";
import { OutputService, formattedText, helpText, waitingForFileChangesText } from "#output";
import { SetupReporter } from "#reporters";
import { Runner } from "#runner";
import { SelectService } from "#select";
import { Store } from "#store";
import { CancellationReason, CancellationToken } from "#token";
import { FileWatcher, type WatchHandler, Watcher } from "#watch";

export class Cli {
  #eventEmitter = new EventEmitter();

  async run(commandLineArguments: Array<string>, cancellationToken = new CancellationToken()): Promise<void> {
    const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.ConfigError);
    this.#eventEmitter.addHandler(cancellationHandler);

    const exitCodeHandler = new ExitCodeHandler();
    this.#eventEmitter.addHandler(exitCodeHandler);

    const setupReporter = new SetupReporter();
    this.#eventEmitter.addReporter(setupReporter);

    if (commandLineArguments.includes("--help")) {
      const commandLineOptionDefinitions = OptionDefinitionsMap.for(OptionGroup.CommandLine);

      OutputService.writeMessage(helpText(commandLineOptionDefinitions, Runner.version));

      return;
    }

    if (commandLineArguments.includes("--version")) {
      OutputService.writeMessage(formattedText(Runner.version));

      return;
    }

    if (commandLineArguments.includes("--prune")) {
      await Store.prune();

      return;
    }

    if (commandLineArguments.includes("--update")) {
      await Store.update();

      return;
    }

    const configService = new ConfigService();

    await configService.parseCommandLine(commandLineArguments);

    if (cancellationToken.isCancellationRequested) {
      return;
    }

    do {
      if (cancellationToken.reason === CancellationReason.ConfigChange) {
        cancellationToken.reset();
        exitCodeHandler.resetCode();

        OutputService.clearTerminal();

        this.#eventEmitter.addHandler(cancellationHandler);
        this.#eventEmitter.addReporter(setupReporter);
      }

      await configService.readConfigFile();

      let resolvedConfig = configService.resolveConfig();

      if (cancellationToken.isCancellationRequested) {
        if (commandLineArguments.includes("--watch")) {
          await this.#waitForChangedFiles(resolvedConfig, /* selectService */ undefined, cancellationToken);
        }
        continue;
      }

      for (const plugin of resolvedConfig.plugins) {
        const hooks: Hooks = (await import(plugin)).default;
        HooksService.addHandler(hooks);
      }

      resolvedConfig = await HooksService.call("config", resolvedConfig);

      if (commandLineArguments.includes("--showConfig")) {
        OutputService.writeMessage(formattedText({ ...resolvedConfig }));
        continue;
      }

      if (commandLineArguments.includes("--install")) {
        for (const tag of resolvedConfig.target) {
          await Store.install(tag);
        }
        continue;
      }

      const selectService = new SelectService(resolvedConfig);
      let testFiles: Array<string | URL> = [];

      if (resolvedConfig.testFileMatch.length > 0) {
        testFiles = await selectService.selectFiles();

        if (testFiles.length === 0) {
          if (commandLineArguments.includes("--watch")) {
            await this.#waitForChangedFiles(resolvedConfig, selectService, cancellationToken);
          }
          continue;
        }
      }

      testFiles = await HooksService.call("select", testFiles);

      if (commandLineArguments.includes("--listFiles")) {
        OutputService.writeMessage(formattedText(testFiles.map((testFile) => testFile.toString())));
        continue;
      }

      this.#eventEmitter.removeHandler(cancellationHandler);
      this.#eventEmitter.removeReporter(setupReporter);

      const runner = new Runner(resolvedConfig, selectService);

      await runner.run(testFiles, cancellationToken);
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

      OutputService.writeMessage(waitingForFileChangesText());

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
