import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { InputService } from "#input";
import type { SelectService } from "#select";
import { WatchService } from "#watch";

export type RunCallback = (testFiles: Array<TestFile>) => void;

export class WatchModeManager {
  #changedTestFiles = new Map<string, TestFile>();
  #inputService: InputService;
  #runCallback: RunCallback;
  #runTimeout: ReturnType<typeof setTimeout> | undefined;
  #selectService: SelectService;
  #watchService: WatchService;
  #watchedTestFiles: Map<string, TestFile>;

  constructor(runCallback: RunCallback, selectService: SelectService, testFiles: Array<TestFile>) {
    this.#inputService = new InputService();
    this.#runCallback = runCallback;
    this.#selectService = selectService;
    this.#watchService = new WatchService();
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
              this.#inputService.close();
              this.#watchService.close();
              break;
            }
          }
          break;
        }

        case "watch:info": {
          switch (payload.state) {
            case "changed": {
              let testFile = this.#watchedTestFiles.get(payload.filePath);

              if (testFile != null) {
                this.#changedTestFiles.set(payload.filePath, testFile);
                break;
              }

              if (this.#selectService.isTestFile(payload.filePath)) {
                testFile = new TestFile(payload.filePath);

                this.#changedTestFiles.set(payload.filePath, testFile);
                this.#watchedTestFiles.set(payload.filePath, testFile);
              }

              break;
            }

            case "removed": {
              this.#changedTestFiles.delete(payload.filePath);
              this.#watchedTestFiles.delete(payload.filePath);
              break;
            }
          }

          this.#rerunChanged();

          break;
        }

        default:
          break;
      }
    });
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

  async watch(rootPath: string): Promise<void> {
    await this.#watchService.watch(rootPath, { recursive: true });
  }
}
