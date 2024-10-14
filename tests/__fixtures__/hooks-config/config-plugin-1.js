/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  config: (options) => {
    return { ...options, failFast: true };
  },
};
