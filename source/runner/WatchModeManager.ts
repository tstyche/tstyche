import { setTimeout } from "node:timers/promises";
import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { InputService } from "#input";
import { Path } from "#path";
import type { SelectService } from "#select";
import { CancellationReason, type CancellationToken } from "#token";
import { type WatchEventHandler, Watcher } from "#watcher";

export type RunCallback = (testFiles: Array<TestFile>) => void | Promise<void>;

export class WatchModeManager {
  #abortController = new AbortController();
  #changedTestFiles = new Map<string, TestFile>();
  #inputService: InputService;
  #runCallback: RunCallback;
  #selectService: SelectService;
  #watchers: Array<Watcher> = [];
  #watchedTestFiles: Map<string, TestFile>;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    runCallback: RunCallback,
    selectService: SelectService,
    testFiles: Array<TestFile>,
  ) {
    this.#inputService = new InputService();
    this.#runCallback = runCallback;
    this.#selectService = selectService;
    this.#watchedTestFiles = new Map(testFiles.map((testFile) => [testFile.path, testFile]));

    EventEmitter.addHandler(([eventName, payload]) => {
      switch (eventName) {
        case "input:info": {
          switch (payload.key) {
            case "\u000D" /* Return */:
            case "\u0020" /* Space */:
            case "\u0041" /* Latin capital letter A */:
            case "\u0061" /* Latin small letter A */: {
              this.#runAll();
              break;
            }

            case "\u0003" /* Ctrl-C */:
            case "\u0004" /* Ctrl-D */:
            case "\u001B" /* Escape */:
            case "\u0058" /* Latin capital letter X */:
            case "\u0078" /* Latin small letter X */: {
              this.close();
              break;
            }
          }

          break;
        }

        default:
          break;
      }
    });
  }

  close(): void {
    for (const watcher of this.#watchers) {
      watcher.close();
    }

    this.#inputService.close();
  }

  #runAll() {
    this.#runCallback([...this.#watchedTestFiles.values()]);
  }

  #runChanged() {
    this.#abortController.abort();
    this.#abortController = new AbortController();

    if (this.#changedTestFiles.size !== 0) {
      setTimeout(100, this.#changedTestFiles, { signal: this.#abortController.signal })
        .then(async (changedTestFiles) => {
          const testFiles = [...changedTestFiles.values()];
          this.#changedTestFiles.clear();
          await this.#runCallback(testFiles);
        })
        .catch((error) => {
          if (error instanceof Error && error.name === "AbortError") {
            // the timeout was aborted
          }
        });
    }
  }

  watch(cancellationToken?: CancellationToken): Promise<Array<void>> {
    const onChangedFile: WatchEventHandler = (filePath) => {
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

    const onRemovedFile: WatchEventHandler = (filePath) => {
      this.#changedTestFiles.delete(filePath);
      this.#watchedTestFiles.delete(filePath);
    };

    this.#watchers.push(new Watcher(this.resolvedConfig.rootPath, onChangedFile, onRemovedFile, true));

    const onChangedConfigFile: WatchEventHandler = (filePath) => {
      if (filePath === this.resolvedConfig.configFilePath) {
        cancellationToken?.cancel(CancellationReason.ConfigChange);
      }
    };

    this.#watchers.push(new Watcher(Path.dirname(this.resolvedConfig.configFilePath), onChangedConfigFile));

    return Promise.all(this.#watchers.map((watcher) => watcher.watch()));
  }
}
