import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { SelectService } from "#select";
import { InputService, type ReadStream } from "./InputService.js";

export interface WatcherOptions {
  stdin?: ReadStream;
}

export type RunCallback = (testFiles: Array<string>) => Promise<void>;

export class Watcher {
  #abortController = new AbortController();
  #changedTestFiles = new Set<string>();
  #inputHandler: InputService;
  #runCallback: RunCallback;
  #runChangedDebounced: () => Promise<void>;
  #selectService: SelectService;
  #testFiles: Set<string>;
  #watcher: AsyncIterable<fs.FileChangeInfo<string>> | undefined;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    runCallback: RunCallback,
    selectService: SelectService,
    testFiles: Array<string>,
  ) {
    this.#inputHandler = new InputService();
    this.#runCallback = runCallback;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.#runChangedDebounced = this.#debounce(this.#runChanged, 100);
    this.#selectService = selectService;
    this.#testFiles = new Set(testFiles);

    EventEmitter.addHandler(async ([eventName, payload]) => {
      if (eventName === "input") {
        switch (payload.key) {
          case "\u000D": // Return
          case "\u0041": // Latin capital letter A
          case "\u0061": // Latin small letter A
            await this.#runAll();
            break;

          case "\u0003": // Ctrl-C
          case "\u0004": // Ctrl-D
          case "\u001B": // Escape
          case "\u0058": // Latin capital letter X
          case "\u0078": // Latin small letter X
            this.#abortController.abort();
            break;
        }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #debounce<T extends (...args: any) => any>(target: T, delay: number) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        target.apply(this, args);
      }, delay);
    } as T;
  }

  #onChanged(fileName: string) {
    if (this.#testFiles.has(fileName)) {
      this.#changedTestFiles.add(fileName);

      return;
    }

    if (this.#selectService.isTestFile(fileName)) {
      this.#changedTestFiles.add(fileName);
      this.#testFiles.add(fileName);
    }

    // TODO handle dependency files as well
  }

  #onExit() {
    this.#inputHandler.dispose();
    this.#watcher = undefined;
  }

  #onRemoved(fileName: string) {
    this.#changedTestFiles.delete(fileName);
    this.#testFiles.delete(fileName);

    // TODO handle dependency files as well
  }

  async #runAll() {
    await this.#runCallback([...this.#testFiles].sort());
  }

  async #runChanged() {
    await this.#runCallback([...this.#changedTestFiles].sort());

    this.#changedTestFiles.clear();
  }

  async watch(): Promise<void> {
    this.#watcher = fs.watch(this.resolvedConfig.rootPath, { recursive: true, signal: this.#abortController.signal });

    await this.#runAll();

    try {
      for await (const event of this.#watcher) {
        if (event.filename != null) {
          const filePath = Path.resolve(this.resolvedConfig.rootPath, event.filename);

          // TODO if this is TSTyche config file: emit 'watch, { state: "restart" }' event and 'break' this loop

          if (!existsSync(filePath)) {
            this.#onRemoved(filePath);
            continue;
          }

          this.#onChanged(filePath);
        }

        if (this.#changedTestFiles.size !== 0) {
          await this.#runChangedDebounced();
        }
      }
    } catch (error) {
      if (error != null && typeof error === "object" && "name" in error && error.name === "AbortError") {
        // the watcher was aborted
      } else {
        throw error;
      }
    } finally {
      this.#onExit();
    }
  }
}
