import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Path } from "#path";

export type WatchHandler = (filePath: string) => void | Promise<void>;

export class Watcher {
  #abortController = new AbortController();
  #onChanged: WatchHandler;
  #onRemoved: WatchHandler;
  #recursive: boolean | undefined;
  #targetPath: string;
  #watcher: AsyncIterable<{ filename?: string | null }> | undefined;

  constructor(targetPath: string, onChanged: WatchHandler, onRemoved?: WatchHandler, recursive?: boolean) {
    this.#targetPath = targetPath;
    this.#onChanged = onChanged;
    this.#onRemoved = onRemoved ?? onChanged;
    // TODO must be 'options.recursive'
    this.#recursive = recursive;
  }

  close(): void {
    this.#abortController.abort();
  }

  async watch(): Promise<void> {
    this.#watcher = fs.watch(this.#targetPath, { recursive: this.#recursive, signal: this.#abortController.signal });

    try {
      for await (const event of this.#watcher) {
        if (event.filename != null) {
          const filePath = Path.resolve(this.#targetPath, event.filename);

          if (existsSync(filePath)) {
            await this.#onChanged(filePath);
          } else {
            await this.#onRemoved(filePath);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // the watcher was aborted
      }
    }
  }
}
