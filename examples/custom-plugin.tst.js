/**
 * @type {import("tstyche/tstyche").Hooks}
 */
export default {
  config: (resolvedConfig) => {
    return {
      ...resolvedConfig,
      reporters: [new URL("./custom-reporter.js", import.meta.url).toString()],
      testFileMatch: [] /* disables look up */,
    };
  },

  select: (testFiles) => {
    return testFiles.filter((testFile) => !testFile.endsWith("toBeNumber.test.ts"));
  },
};
