import { type FSWatcher, existsSync, watch } from "node:fs";
import { Path } from "#path";

export type WatchEventHandler = (filePath: string) => void;

export interface WatcherOptions {
  onChanged?: WatchEventHandler;
  onRemoved?: WatchEventHandler;
  recursive?: boolean;
}

export class Watcher {
  #onChanged: WatchEventHandler | undefined;
  #onRemoved: WatchEventHandler | undefined;
  #watcher: FSWatcher;

  constructor(targetPath: string, options?: WatcherOptions) {
    this.#onChanged = options?.onChanged;
    this.#onRemoved = options?.onRemoved ?? options?.onChanged;

    this.#watcher = watch(targetPath, { recursive: options?.recursive }, (_eventType, fileName) => {
      if (fileName != null) {
        const filePath = Path.resolve(targetPath, fileName);

        if (existsSync(filePath)) {
          this.#onChanged?.(filePath);
        } else {
          this.#onRemoved?.(filePath);
        }
      }
    });
  }

  close(): void {
    this.#watcher.close();
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
}
