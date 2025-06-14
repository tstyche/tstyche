import { existsSync, type FSWatcher, watch } from "node:fs";
import { Path } from "#path";

export type WatchHandler = (filePath: string) => void;

export interface WatcherOptions {
  recursive?: boolean;
}

export class Watcher {
  #onChanged: WatchHandler;
  #onRemoved: WatchHandler;
  #recursive: boolean | undefined;
  #targetPath: string;
  #watcher: FSWatcher | undefined;

  constructor(targetPath: string, onChanged: WatchHandler, onRemoved?: WatchHandler, options?: WatcherOptions) {
    this.#targetPath = targetPath;
    this.#onChanged = onChanged;
    this.#onRemoved = onRemoved ?? onChanged;
    this.#recursive = options?.recursive;
  }

  close(): void {
    this.#watcher?.close();
  }

  watch(): void {
    this.#watcher = watch(this.#targetPath, { recursive: this.#recursive }, (_eventType, fileName) => {
      if (fileName != null) {
        const filePath = Path.resolve(this.#targetPath, fileName);

        if (existsSync(filePath)) {
          this.#onChanged(filePath);
        } else {
          this.#onRemoved(filePath);
        }
      }
    });
  }
}
