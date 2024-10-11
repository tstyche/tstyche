import { TSTyche } from "tstyche/tstyche";

TSTyche.addHooks({
  config: () => {
    return { failFast: true };
  },
});
