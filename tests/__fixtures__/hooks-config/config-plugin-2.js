/**
 * @type {import("tstyche/tstyche").Plugin}
 */
export default {
  config: () => {
    return { testFileMatch: [] };
  },
  select: () => {
    return ["./examples/firstItem.tst.ts"];
  },
};
