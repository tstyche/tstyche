import { Path } from "#path";
import { Watcher, type WatchHandler } from "./Watcher.js";

export type FileWatchHandler = () => void;

export class FileWatcher extends Watcher {
  constructor(targetPath: string, onChanged: FileWatchHandler) {
    const onChangedFile: WatchHandler = (filePath) => {
      if (filePath === targetPath) {
        onChanged();
      }
    };

    // installing a watcher on a directory allows watching for files that do not exist yet (e.g. config files)
    super(Path.dirname(targetPath), onChangedFile);
  }
}
