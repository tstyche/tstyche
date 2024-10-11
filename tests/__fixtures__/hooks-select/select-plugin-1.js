import { TSTyche } from "tstyche/tstyche";

TSTyche.addHooks({
  select: (testFiles) => {
    return [...testFiles, new URL("./ts-tests/toBeString.test.ts", import.meta.url)];
  },
});
