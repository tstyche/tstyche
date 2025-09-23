import { Config, OptionGroup, Options, type ResolvedConfig } from "#config";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { CancellationHandler, ExitCodeHandler } from "#handlers";
import { formattedText, helpText, OutputService, waitingForFileChangesText } from "#output";
import { type Plugin, PluginService } from "#plugins";
import { SetupReporter } from "#reporters";
import { Runner } from "#runner";
import { Select } from "#select";
import { Store } from "#store";
import { CancellationReason, CancellationToken } from "#token";
import { FileWatcher, Watcher, type WatchHandler } from "#watch";

export class Cli {
  #eventEmitter = new EventEmitter();

  async run(commandLine: Array<string>, cancellationToken = new CancellationToken()): Promise<void> {
    const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.ConfigError);
    this.#eventEmitter.addHandler(cancellationHandler);

    const exitCodeHandler = new ExitCodeHandler();
    this.#eventEmitter.addHandler(exitCodeHandler);

    const setupReporter = new SetupReporter();
    this.#eventEmitter.addReporter(setupReporter);

    if (commandLine.includes("--help")) {
      const options = Options.for(OptionGroup.CommandLine);

      OutputService.writeMessage(helpText(options, Runner.version));

      return;
    }

    if (commandLine.includes("--version")) {
      OutputService.writeMessage(formattedText(Runner.version));

      return;
    }

    if (commandLine.includes("--list")) {
      await Store.open();

      if (Store.manifest != null) {
        OutputService.writeMessage(
          formattedText({ resolutions: Store.manifest.resolutions, versions: Store.manifest.versions }),
        );
      }

      return;
    }

    if (commandLine.includes("--prune")) {
      await Store.prune();

      return;
    }

    if (commandLine.includes("--update")) {
      await Store.update();

      return;
    }

    const { commandLineOptions, pathMatch } = await Config.parseCommandLine(commandLine);

    if (cancellationToken.isCancellationRequested()) {
      return;
    }

    do {
      if (cancellationToken.getReason() === CancellationReason.ConfigChange) {
        cancellationToken.reset();
        exitCodeHandler.resetCode();

        OutputService.clearTerminal();

        this.#eventEmitter.addHandler(cancellationHandler);
        this.#eventEmitter.addReporter(setupReporter);
      }

      const { configFileOptions, configFilePath } = await Config.parseConfigFile(commandLineOptions.config);

      let resolvedConfig = Config.resolve({
        configFileOptions,
        configFilePath,
        commandLineOptions,
        pathMatch,
      });

      if (cancellationToken.isCancellationRequested()) {
        if (commandLine.includes("--watch")) {
          await this.#waitForChangedFiles(resolvedConfig, cancellationToken);
        }
        continue;
      }

      for (const pluginSpecifier of resolvedConfig.plugins) {
        const plugin: Plugin = (await import(pluginSpecifier)).default;
        PluginService.addHandler(plugin);
      }

      resolvedConfig = await PluginService.call("config", resolvedConfig, /* context */ {});

      if (commandLine.includes("--showConfig")) {
        OutputService.writeMessage(formattedText({ ...resolvedConfig, ...environmentOptions }));
        continue;
      }

      if (commandLine.includes("--fetch")) {
        for (const tag of resolvedConfig.target) {
          await Store.fetch(tag);
        }
        continue;
      }

      let testFiles: Array<string | URL> = [];

      if (resolvedConfig.testFileMatch.length > 0) {
        testFiles = await Select.selectFiles(resolvedConfig);

        if (testFiles.length === 0) {
          if (commandLine.includes("--watch")) {
            await this.#waitForChangedFiles(resolvedConfig, cancellationToken);
          }
          continue;
        }
      }

      testFiles = await PluginService.call("select", testFiles as Array<string>, { resolvedConfig });

      if (commandLine.includes("--listFiles")) {
        OutputService.writeMessage(formattedText(testFiles.map((testFile) => testFile.toString())));
        continue;
      }

      this.#eventEmitter.removeHandler(cancellationHandler);
      this.#eventEmitter.removeReporter(setupReporter);

      const runner = new Runner(resolvedConfig);

      await runner.run(testFiles, cancellationToken);

      PluginService.removeHandlers();
    } while (cancellationToken.getReason() === CancellationReason.ConfigChange);

    this.#eventEmitter.removeHandlers();
  }

  #waitForChangedFiles(resolvedConfig: ResolvedConfig, cancellationToken: CancellationToken) {
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

      const onChangedTestFile: WatchHandler = (filePath) => {
        if (Select.isTestFile(filePath, resolvedConfig)) {
          onChanged();
        }
      };

      const onRemoved: WatchHandler = () => {
        // do nothing, only added files are important
      };

      watchers.push(new Watcher(resolvedConfig.rootPath, onChangedTestFile, onRemoved, { recursive: true }));

      for (const watcher of watchers) {
        watcher.watch();
      }
    });
  }
}
