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

    // installing a watcher on a directory allows watching for files that do not exist yet (e.g. config files)
    super(Path.dirname(targetPath), onChangedFile);
  }
}
