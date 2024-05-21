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
  #recursive: boolean | undefined;
  #watcher: FSWatcher | undefined;

  constructor(
    readonly targetPath: string,
    options?: WatcherOptions,
  ) {
    this.#onChanged = options?.onChanged;
    this.#onRemoved = options?.onRemoved ?? options?.onChanged;
    this.#recursive = options?.recursive;
  }

  close(): void {
    this.#watcher?.close();
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

  watch(): Promise<void> {
    this.#watcher = watch(this.targetPath, { recursive: this.#recursive });

    this.#watcher.on("change", (_eventType, fileName) => {
      if (fileName != null) {
        const filePath = Path.resolve(this.targetPath, fileName as string);

        if (existsSync(filePath)) {
          this.#onChanged?.(filePath);
        } else {
          this.#onRemoved?.(filePath);
        }
      }
    });

    return new Promise<void>((resolve) => {
      this.#watcher?.on("close", () => {
        resolve();
      });
    });
  }
}
