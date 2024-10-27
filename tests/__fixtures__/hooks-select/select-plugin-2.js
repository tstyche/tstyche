import path from "node:path";

/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  name: "select-plugin-2",

  select() {
    return [path.join(this.resolvedConfig.rootPath, "./ts-tests/toBeNumber.test.ts")];
  },
};
