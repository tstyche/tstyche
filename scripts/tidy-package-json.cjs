const deleteKeys = ["files", "scripts", "devDependencies", "packageManager"];

module.exports = {
  name: "tidy-package-json",
  factory: () => ({
    hooks: {
      /**
       * @param {never} _workspace
       * @param {Record<string, unknown>} packageConfig
       */
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
