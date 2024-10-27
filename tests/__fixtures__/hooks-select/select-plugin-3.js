/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  name: "select-plugin-3",

  config: (resolvedConfig) => {
    return { ...resolvedConfig, failFast: true };
  },
};
