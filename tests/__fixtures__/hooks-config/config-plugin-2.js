import { TSTyche } from "tstyche/tstyche";

TSTyche.addHooks({
  config: () => {
    return { testFileMatch: [] };
  },
  select: () => {
    return ["./examples/firstItem.tst.ts"];
  },
});
