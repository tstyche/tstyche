import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { InputService } from "#input";
import { Path } from "#path";
import type { SelectService } from "#select";
import { CancellationReason, type CancellationToken } from "#token";
import { Timer } from "./Timer.js";
import { type WatchEventHandler, Watcher } from "./Watcher.js";

export type RunCallback = (testFiles: Array<TestFile>) => Promise<void>;

export class WatchModeManager {
  #changedTestFiles = new Map<string, TestFile>();
  #inputService = new InputService();
  #runCallback: RunCallback;
  #selectService: SelectService;
  #timer = new Timer();
  #watchers: Array<Watcher> = [];
  #watchedTestFiles: Map<string, TestFile>;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    runCallback: RunCallback,
    selectService: SelectService,
    testFiles: Array<TestFile>,
  ) {
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
    this.#inputService.close();
    this.#timer.clear();

    for (const watcher of this.#watchers) {
      watcher.close();
    }
  }

  #runAll() {
    this.#runCallback([...this.#watchedTestFiles.values()]);
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
