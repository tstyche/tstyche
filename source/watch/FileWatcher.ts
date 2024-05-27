import { Path } from "#path";
import { type WatchHandler, Watcher } from "./Watcher.js";

export type FileWatchHandler = () => void | Promise<void>;

export class FileWatcher extends Watcher {
  constructor(targetPath: string, onChanged: FileWatchHandler) {
    const onChangedFile: WatchHandler = async (filePath) => {
      if (filePath === targetPath) {
        await onChanged();
      }
    };

    super(Path.dirname(targetPath), onChangedFile);
  }
}
