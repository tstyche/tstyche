import type { ResolvedConfig } from "#config";
import { Path } from "#path";
import { type WatchHandler, Watcher } from "./Watcher.js";

export type ConfigWatchHandler = () => void | Promise<void>;

export class ConfigWatcher extends Watcher {
  constructor(
    readonly resolvedConfig: ResolvedConfig,
    onChangedConfig: ConfigWatchHandler,
  ) {
    const onChangedFile: WatchHandler = async (filePath) => {
      if (filePath === resolvedConfig.configFilePath) {
        await onChangedConfig();
      }
    };

    super(Path.dirname(resolvedConfig.configFilePath), onChangedFile);
  }
}
