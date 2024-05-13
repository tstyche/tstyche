import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { EventEmitter } from "#events";
import { Path } from "#path";

export class WatchService {
  #abortController = new AbortController();
  #watcher: AsyncIterable<{ filename?: string | null }> | undefined;

  close(): void {
    this.#abortController.abort();
  }

  async watch(rootPath: string): Promise<void> {
    this.#watcher = fs.watch(rootPath, { recursive: true, signal: this.#abortController.signal });

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
