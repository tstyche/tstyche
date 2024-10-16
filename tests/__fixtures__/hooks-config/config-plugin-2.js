/**
 * @type {import("tstyche/tstyche").Hooks}
 */
export default {
  config: (resolvedConfig) => {
    return { ...resolvedConfig, testFileMatch: [] };
  },
  select: () => {
    return ["./examples/firstItem.tst.ts"];
  },
};
