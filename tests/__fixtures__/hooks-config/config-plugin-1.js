/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  name: "config-plugin-1",

  config: (resolvedConfig) => {
    return { ...resolvedConfig, failFast: true };
  },
};
