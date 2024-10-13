/**
  * @type {import("tstyche/tstyche").Plugin}
  */
export default {
  select: (testFiles) => {
    return [...testFiles, new URL("./ts-tests/toBeString.test.ts", import.meta.url)];
  },
};
