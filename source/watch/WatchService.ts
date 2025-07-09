import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { type InputHandler, InputService } from "#input";
import { Select, SelectDiagnosticText } from "#select";
import { Task } from "#task";
import { CancellationReason, type CancellationToken } from "#token";
import { Debounce, type ResolveHandler } from "./Debounce.js";
import { FileWatcher } from "./FileWatcher.js";
import { Watcher, type WatchHandler } from "./Watcher.js";

export class WatchService {
  #changedTestFiles = new Map<string, Task>();
  #inputService: InputService | undefined;
  #resolvedConfig: ResolvedConfig;
  #watchedTestFiles: Map<string, Task>;
  #watchers: Array<Watcher> = [];

  constructor(resolvedConfig: ResolvedConfig, tasks: Array<Task>) {
    this.#resolvedConfig = resolvedConfig;

    this.#watchedTestFiles = new Map(tasks.map((task) => [task.filePath, task]));
  }

  #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["watch:error", { diagnostics: [diagnostic] }]);
  }

  async *watch(cancellationToken: CancellationToken): AsyncIterable<Array<Task>> {
    const onResolve: ResolveHandler<Array<Task>> = () => {
      const testFiles = [...this.#changedTestFiles.values()];
      this.#changedTestFiles.clear();

      return testFiles;
    };

    const debounce = new Debounce<Array<Task>>(100, onResolve);

    const onClose = (reason: CancellationReason) => {
      debounce.cancel();

      this.#inputService?.close();

      for (const watcher of this.#watchers) {
        watcher.close();
      }

      cancellationToken.cancel(reason);

      debounce.resolve([]);
    };

    if (!environmentOptions.noInteractive) {
      const onInput: InputHandler = (chunk) => {
        switch (chunk.toLowerCase()) {
          case "\u0003" /* Ctrl-C */:
          case "\u0004" /* Ctrl-D */:
          case "\u001B" /* Escape */:
          case "q":
          case "x":
            onClose(CancellationReason.WatchClose);
            break;

          case "\u000D" /* Return */:
          case "\u0020" /* Space */:
          case "a":
            debounce.cancel();

            if (this.#watchedTestFiles.size > 0) {
              debounce.resolve([...this.#watchedTestFiles.values()]);
            }
            break;
        }
      };

      this.#inputService = new InputService(onInput);
    }

    const onChangedFile: WatchHandler = (filePath) => {
      debounce.refresh();

      let task = this.#watchedTestFiles.get(filePath);

      if (task != null) {
        this.#changedTestFiles.set(filePath, task);
      } else if (Select.isTestFile(filePath, this.#resolvedConfig)) {
        task = new Task(filePath);

        this.#changedTestFiles.set(filePath, task);
        this.#watchedTestFiles.set(filePath, task);
      }
    };

    const onRemovedFile: WatchHandler = (filePath) => {
      this.#changedTestFiles.delete(filePath);
      this.#watchedTestFiles.delete(filePath);

      if (this.#watchedTestFiles.size === 0) {
        debounce.cancel();

        this.#onDiagnostics(Diagnostic.error(SelectDiagnosticText.noTestFilesWereLeft(this.#resolvedConfig)));
      }
    };

    this.#watchers.push(new Watcher(this.#resolvedConfig.rootPath, onChangedFile, onRemovedFile, { recursive: true }));

    const onChangedConfigFile = () => {
      onClose(CancellationReason.ConfigChange);
    };

    this.#watchers.push(new FileWatcher(this.#resolvedConfig.configFilePath, onChangedConfigFile));

    for (const watcher of this.#watchers) {
      watcher.watch();
    }

    while (!cancellationToken.isCancellationRequested) {
      const testFiles = await debounce.schedule();

      if (testFiles.length > 0) {
        yield testFiles;
      }
    }
  }
}
