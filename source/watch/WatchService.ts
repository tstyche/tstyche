import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { type InputHandler, InputService } from "#input";
import { SelectDiagnosticText, type SelectService } from "#select";
import { CancellationReason, type CancellationToken } from "#token";
import { Debounce, type ResolveHandler } from "./Debounce.js";
import { FileWatcher } from "./FileWatcher.js";
import { type WatchHandler, Watcher } from "./Watcher.js";

export class WatchService {
  #changedTestFiles = new Map<string, TestFile>();
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

  #onDiagnostics(this: void, diagnostics: Diagnostic | Array<Diagnostic>) {
    EventEmitter.dispatchDiagnostics("watch:error", diagnostics);
  }

  async *watch(cancellationToken: CancellationToken): AsyncIterable<Array<TestFile>> {
    const onResolve: ResolveHandler<Array<TestFile>> = () => {
      const testFiles = [...this.#changedTestFiles.values()];
      this.#changedTestFiles.clear();

      return testFiles;
    };

    const debounce = new Debounce<Array<TestFile>>(100, onResolve);

    const onClose = (reason: CancellationReason) => {
      debounce.clearTimeout();

      this.#inputService?.close();

      for (const watcher of this.#watchers) {
        watcher.close();
      }

      cancellationToken.cancel(reason);

      debounce.resolveWith([]);
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
          debounce.clearTimeout();

          if (this.#watchedTestFiles.size !== 0) {
            debounce.resolveWith([...this.#watchedTestFiles.values()]);
          }

          break;
        }
      }
    };

    this.#inputService = new InputService(onInput);

    const onChangedFile: WatchHandler = (filePath) => {
      debounce.refreshTimeout();

      let testFile = this.#watchedTestFiles.get(filePath);

      if (testFile != null) {
        this.#changedTestFiles.set(filePath, testFile);
      } else if (this.#selectService.isTestFile(filePath)) {
        testFile = new TestFile(filePath);

        this.#changedTestFiles.set(filePath, testFile);
        this.#watchedTestFiles.set(filePath, testFile);
      }
    };

    const onRemovedFile: WatchHandler = (filePath) => {
      this.#changedTestFiles.delete(filePath);
      this.#watchedTestFiles.delete(filePath);

      if (this.#watchedTestFiles.size === 0) {
        debounce.clearTimeout();

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
      const testFiles = await debounce.setup();

      if (testFiles.length > 0) {
        yield testFiles;
      }
    }
  }
}
