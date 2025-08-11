// TODO remove the plugin after fixing: https://github.com/yarnpkg/berry/issues/6793

const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * @typedef {Object} Hooks
 * @property {(executor: () => Promise<number>, _project: never, _locator: never, scriptName: string ) => () => Promise<number>} wrapScriptExecution
 */

const changelogFileName = "CHANGELOG.md";

const changelogFilePath = path.resolve(changelogFileName);
const hiddenFilePath = path.resolve(`.${changelogFileName}`);

module.exports = {
  name: "hide-changelog",
  factory: () => ({
    /** @type {Hooks} */
    hooks: {
      wrapScriptExecution(executor, _project, _locator, scriptName) {
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
  }),
};
