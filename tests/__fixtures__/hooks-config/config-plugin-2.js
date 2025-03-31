/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  name: "config-plugin-2",

  config(resolvedConfig) {
    return { ...resolvedConfig, testFileMatch: [] };
  },

  select() {
    return ["./examples/firstItem.tst.ts"];
  },
};
