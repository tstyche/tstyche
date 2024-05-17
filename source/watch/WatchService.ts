import { existsSync, watch } from "node:fs";
import fs from "node:fs/promises";
import { EventEmitter } from "#events";
import { Path } from "#path";

export interface WatchOptions {
  recursive?: boolean;
}

export class WatchService {
  #abortController = new AbortController();
  #watcher: AsyncIterable<{ filename?: string | null }> | undefined;

  close(): void {
    this.#abortController.abort();
  }

  static isSupported(): boolean {
    let isRecursiveWatchAvailable: boolean | undefined;

    try {
      watch(Path.resolve("."), { persistent: false, recursive: true, signal: AbortSignal.abort() });
      isRecursiveWatchAvailable = true;
    } catch {
      isRecursiveWatchAvailable = false;
    }

    return isRecursiveWatchAvailable;
  }

  async watch(rootPath: string, options?: WatchOptions): Promise<void> {
    this.#watcher = fs.watch(rootPath, { recursive: options?.recursive, signal: this.#abortController.signal });

    try {
      for await (const event of this.#watcher) {
        if (event.filename != null) {
          const filePath = Path.resolve(rootPath, event.filename);

          if (existsSync(filePath)) {
            EventEmitter.dispatch(["watch:info", { filePath, state: "changed" }]);
          } else {
            EventEmitter.dispatch(["watch:info", { filePath, state: "removed" }]);
          }
        }
      }
    } catch (error) {
      if (error != null && typeof error === "object" && "name" in error && error.name === "AbortError") {
        // the watcher was aborted
      } else {
        throw error;
      }
    }
  }
}
