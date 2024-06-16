import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { type InputHandler, InputService } from "#input";
import { SelectDiagnosticText, type SelectService } from "#select";
import { CancellationReason, type CancellationToken } from "#token";
import { Debounce } from "./Debounce.js";
import { FileWatcher } from "./FileWatcher.js";
import { type WatchHandler, Watcher } from "./Watcher.js";

export class WatchService {
  #debounce = new Debounce(100);
  #enqueuedTestFiles = new Map<string, TestFile>();
  #inputService: InputService | undefined;
  #resolvedConfig: ResolvedConfig;
  #selectService: SelectService;
  #watchers: Array<Watcher> = [];
  #watchedTestFiles: Map<string, TestFile>;

  constructor(resolvedConfig: ResolvedConfig, selectService: SelectService, testFiles: Array<TestFile>) {
    this.#resolvedConfig = resolvedConfig;
    this.#selectService = selectService;

    this.#watchedTestFiles = new Map(testFiles.map((testFile) => [testFile.path, testFile]));
  }

  #onDiagnostic(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["watch:error", { diagnostics: [diagnostic] }]);
  }

  async *watch(cancellationToken: CancellationToken): AsyncIterable<Array<TestFile>> {
    yield [...this.#watchedTestFiles.values()];

    const onClose = (reason: CancellationReason) => {
      this.#debounce.clear();

      this.#inputService?.close();

      for (const watcher of this.#watchers) {
        watcher.close();
      }

      cancellationToken.cancel(reason);

      this.#debounce.resolve();
    };

    const onInput: InputHandler = (chunk) => {
      switch (chunk.toLowerCase()) {
        case "\u0003" /* Ctrl-C */:
        case "\u0004" /* Ctrl-D */:
        case "\u001B" /* Escape */:
        case "q":
        case "x": {
          onClose(CancellationReason.WatchClose);
          break;
        }

        case "\u000D" /* Return */:
        case "\u0020" /* Space */:
        case "a": {
          this.#debounce.clear();

          if (this.#watchedTestFiles.size !== 0) {
            this.#enqueuedTestFiles = new Map(this.#watchedTestFiles);
            this.#debounce.resolve();
          }

          break;
        }
      }
    };

    this.#inputService = new InputService(onInput);

    const onChangedFile: WatchHandler = (filePath) => {
      this.#debounce.refresh();

      let testFile = this.#watchedTestFiles.get(filePath);

      if (testFile != null) {
        this.#enqueuedTestFiles.set(filePath, testFile);
      } else if (this.#selectService.isTestFile(filePath)) {
        testFile = new TestFile(filePath);

        this.#enqueuedTestFiles.set(filePath, testFile);
        this.#watchedTestFiles.set(filePath, testFile);
      }
    };

    const onRemovedFile: WatchHandler = (filePath) => {
      this.#enqueuedTestFiles.delete(filePath);
      this.#watchedTestFiles.delete(filePath);

      if (this.#watchedTestFiles.size === 0) {
        this.#onDiagnostic(Diagnostic.error(SelectDiagnosticText.noTestFilesWereLeft(this.#resolvedConfig)));
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
      if (this.#enqueuedTestFiles.size !== 0) {
        const testFiles = [...this.#enqueuedTestFiles.values()];
        this.#enqueuedTestFiles.clear();

        yield testFiles;
      }

      await this.#debounce.wait();
    }
  }
}
