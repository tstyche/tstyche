import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { type InputHandler, InputService } from "#input";
import { SelectDiagnosticText, type SelectService } from "#select";
import { CancellationReason, type CancellationToken } from "#token";
import { FileWatcher } from "./FileWatcher.js";
import { Timer } from "./Timer.js";
import { type WatchHandler, Watcher } from "./Watcher.js";

export type RunCallback = (testFiles: Array<TestFile>) => Promise<void>;

export class WatchService {
  #changedTestFiles = new Map<string, TestFile>();
  #inputService: InputService;
  #resolvedConfig: ResolvedConfig;
  #runCallback: RunCallback;
  #selectService: SelectService;
  #timer = new Timer();
  #watchers: Array<Watcher> = [];
  #watchedTestFiles: Map<string, TestFile>;

  constructor(
    resolvedConfig: ResolvedConfig,
    runCallback: RunCallback,
    selectService: SelectService,
    testFiles: Array<TestFile>,
  ) {
    this.#resolvedConfig = resolvedConfig;
    this.#runCallback = runCallback;
    this.#selectService = selectService;

    this.#watchedTestFiles = new Map(testFiles.map((testFile) => [testFile.path, testFile]));

    const onInput: InputHandler = (chunk) => {
      switch (chunk.toLowerCase()) {
        case "\u0003" /* Ctrl-C */:
        case "\u0004" /* Ctrl-D */:
        // biome-ignore lint/correctness/noStringCaseMismatch: TODO false positive
        case "\u001B" /* Escape */:
        case "q":
        case "x": {
          this.close();
          break;
        }

        // biome-ignore lint/correctness/noStringCaseMismatch: TODO false positive
        case "\u000D" /* Return */:
        case "\u0020" /* Space */:
        case "a": {
          this.#runAll();
          break;
        }
      }
    };

    this.#inputService = new InputService(onInput);
  }

  close(): void {
    this.#inputService.close();
    this.#timer.clear();

    for (const watcher of this.#watchers) {
      watcher.close();
    }
  }

  #onDiagnostic(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["watch:error", { diagnostics: [diagnostic] }]);
  }

  #runAll() {
    if (this.#watchedTestFiles.size !== 0) {
      this.#runCallback([...this.#watchedTestFiles.values()]);
    }
  }

  #runChanged() {
    this.#timer.clear();

    if (this.#changedTestFiles.size !== 0) {
      const runCallback = async (changedTestFiles: Map<string, TestFile>) => {
        const testFiles = [...changedTestFiles.values()];
        this.#changedTestFiles.clear();

        await this.#runCallback(testFiles);
      };

      this.#timer.set(runCallback, 100, this.#changedTestFiles);
    }
  }

  watch(cancellationToken?: CancellationToken): Promise<Array<void>> {
    const onChangedFile: WatchHandler = (filePath) => {
      let testFile = this.#watchedTestFiles.get(filePath);

      if (testFile != null) {
        this.#changedTestFiles.set(filePath, testFile);
      } else if (this.#selectService.isTestFile(filePath)) {
        testFile = new TestFile(filePath);

        this.#changedTestFiles.set(filePath, testFile);
        this.#watchedTestFiles.set(filePath, testFile);
      }

      this.#runChanged();
    };

    const onRemovedFile: WatchHandler = (filePath) => {
      this.#changedTestFiles.delete(filePath);
      this.#watchedTestFiles.delete(filePath);

      if (this.#watchedTestFiles.size === 0) {
        this.#onDiagnostic(Diagnostic.error(SelectDiagnosticText.noTestFilesWereLeft(this.#resolvedConfig)));
      }
    };

    this.#watchers.push(new Watcher(this.#resolvedConfig.rootPath, onChangedFile, onRemovedFile, { recursive: true }));

    const onChangedConfigFile = () => {
      cancellationToken?.cancel(CancellationReason.ConfigChange);
    };

    this.#watchers.push(new FileWatcher(this.#resolvedConfig.configFilePath, onChangedConfigFile));

    return Promise.all(this.#watchers.map((watcher) => watcher.watch()));
  }
}
