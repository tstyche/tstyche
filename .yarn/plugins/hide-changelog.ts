// TODO remove the plugin after fixing: https://github.com/yarnpkg/berry/issues/6793

import fs from "node:fs/promises";
import path from "node:path";

const changelogFileName = "CHANGELOG.md";

const changelogFilePath = path.resolve(changelogFileName);
const hiddenFilePath = path.resolve(`.${changelogFileName}`);

export const name = "hide-changelog";

export function factory() {
  return {
    hooks: {
      wrapScriptExecution(executor: () => Promise<number>, _project: any, _locator: any, scriptName: string) {
        if (scriptName.startsWith("publish")) {
          return async () => {
            await fs.rename(changelogFilePath, hiddenFilePath);

            const status = await executor();

            await fs.rename(hiddenFilePath, changelogFilePath);

            return status;
          };
        }

        return executor;
      },
    },
  };
}
