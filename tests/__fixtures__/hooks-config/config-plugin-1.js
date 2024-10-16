/**
 * @type {import("tstyche/tstyche").Hooks}
 */
export default {
  config: (resolvedConfig) => {
    return { ...resolvedConfig, failFast: true };
  },
};
