/**
 * @type {import("tstyche/tstyche").Hooks}
 */
export default {
  select: (testFiles) => {
    return [...testFiles, new URL("./ts-tests/toBeString.test.ts", import.meta.url)];
  },
};
