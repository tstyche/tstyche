import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { InputService } from "#input";
import { Path } from "#path";
import type { SelectService } from "#select";
import { CancellationReason, type CancellationToken } from "#token";
import { type WatchEventHandler, Watcher } from "#watcher";

class Deferred {
  promise: Promise<void>;
  reject!: (reason?: unknown) => void;
  resolve!: (value: void | PromiseLike<void>) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

export type RunCallback = (testFiles: Array<TestFile>) => void;

export class WatchModeManager {
  #changedTestFiles = new Map<string, TestFile>();
  #inputService: InputService;
  #runCallback: RunCallback;
  #runTimeout: ReturnType<typeof setTimeout> | undefined;
  #selectService: SelectService;
  #done = new Deferred();
  #watchers = new Set<Watcher>();
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
              this.#rerunAll();
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
    this.#done.resolve();
  }

  #rerunAll() {
    this.#runCallback([...this.#watchedTestFiles.values()]);
  }

  #rerunChanged() {
    clearTimeout(this.#runTimeout);

    if (this.#changedTestFiles.size !== 0) {
      this.#runTimeout = setTimeout(() => {
        const testFiles = [...this.#changedTestFiles.values()];
        this.#changedTestFiles.clear();

        this.#runCallback(testFiles);
      }, 100);
    }
  }

  watch(cancellationToken?: CancellationToken): Promise<void> {
    const onChangedFile: WatchEventHandler = (filePath) => {
      let testFile = this.#watchedTestFiles.get(filePath);

      if (testFile != null) {
        this.#changedTestFiles.set(filePath, testFile);
      } else if (this.#selectService.isTestFile(filePath)) {
        testFile = new TestFile(filePath);

        this.#changedTestFiles.set(filePath, testFile);
        this.#watchedTestFiles.set(filePath, testFile);
      }

      this.#rerunChanged();
    };

    const onRemovedFile: WatchEventHandler = (filePath) => {
      this.#changedTestFiles.delete(filePath);
      this.#watchedTestFiles.delete(filePath);
    };

    this.#watchers.add(
      new Watcher(this.resolvedConfig.rootPath, {
        onChanged: onChangedFile,
        onRemoved: onRemovedFile,
        recursive: true,
      }),
    );

    const onChangedConfigFile: WatchEventHandler = (filePath) => {
      if (filePath === this.resolvedConfig.configFilePath) {
        cancellationToken?.cancel(CancellationReason.ConfigChange);
      }
    };

    this.#watchers.add(
      new Watcher(Path.dirname(this.resolvedConfig.configFilePath), {
        onChanged: onChangedConfigFile,
      }),
    );

    return this.#done.promise;
  }
}
