import { existsSync, watch } from "node:fs";
import fs from "node:fs/promises";
import { Path } from "#path";

export type WatchEventHandler = (filePath: string) => void | Promise<void>;

export class Watcher {
  #abortController = new AbortController();
  #onChanged: WatchEventHandler;
  #onRemoved: WatchEventHandler;
  #recursive: boolean | undefined;
  #watcher: AsyncIterable<{ filename?: string | null }> | undefined;

  constructor(
    readonly targetPath: string,
    onChanged: WatchEventHandler,
    onRemoved?: WatchEventHandler,
    recursive?: boolean,
  ) {
    this.#onChanged = onChanged;
    this.#onRemoved = onRemoved ?? onChanged;
    this.#recursive = recursive;
  }

  close(): void {
    this.#abortController.abort();
  }

  static isSupported(): boolean {
    let isRecursiveWatchAvailable: boolean | undefined;

    try {
      const watcher = watch(Path.resolve("./"), { persistent: false, recursive: true });
      watcher.close();

      isRecursiveWatchAvailable = true;
    } catch {
      isRecursiveWatchAvailable = false;
    }

    return isRecursiveWatchAvailable;
  }

  async watch(): Promise<void> {
    this.#watcher = fs.watch(this.targetPath, { recursive: this.#recursive, signal: this.#abortController.signal });

    try {
      for await (const event of this.#watcher) {
        if (event.filename != null) {
          const filePath = Path.resolve(this.targetPath, event.filename);

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
      } else {
        throw error;
      }
    }
  }
}
