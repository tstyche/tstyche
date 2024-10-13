/**
  * @type {import("tstyche/tstyche").Plugin}
  */
export default {
  select: () => {
    return [new URL("./ts-tests/toBeNumber.test.ts", import.meta.url)];
  },
};
