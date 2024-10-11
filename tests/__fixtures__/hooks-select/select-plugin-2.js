import { TSTyche } from "tstyche/tstyche";

TSTyche.addHooks({
  select: () => {
    return [new URL("./ts-tests/toBeNumber.test.ts", import.meta.url)];
  },
});
