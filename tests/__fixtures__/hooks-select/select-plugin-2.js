/**
 * @type {import("tstyche/tstyche").Hooks}
 */
export default {
  select: () => {
    return [new URL("./ts-tests/toBeNumber.test.ts", import.meta.url)];
  },
};
