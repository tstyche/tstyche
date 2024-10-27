/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  name: "select-plugin-1",

  select: (testFiles) => {
    return [...testFiles, new URL("./ts-tests/toBeString.test.ts", import.meta.url)];
  },
};
