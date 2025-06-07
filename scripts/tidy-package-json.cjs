/**
 * @typedef {Object} Hooks
 * @property {(_workspace: never, packageConfig: Record<string, unknown>) => void} beforeWorkspacePacking
 */

const deleteKeys = ["files", "scripts", "devDependencies", "packageManager", "volta"];

module.exports = {
  name: "tidy-package-json",
  factory: () => ({
    /** @type {Hooks} */
    hooks: {
      beforeWorkspacePacking(_workspace, packageConfig) {
        for (const [key] of Object.entries(packageConfig)) {
          if (deleteKeys.includes(key)) {
            delete packageConfig[key];
          }
        }
      },
    },
  }),
};
