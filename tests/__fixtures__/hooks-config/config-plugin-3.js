import { TSTyche } from "tstyche/tstyche";

TSTyche.addHooks({
  select: () => {
    return ["./examples/firstItem.tst.ts"];
  },
});
