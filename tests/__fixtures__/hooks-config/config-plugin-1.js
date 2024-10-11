import { TSTyche } from "tstyche/tstyche";

TSTyche.addHooks({
  config: (options) => {
    return { ...options, failFast: true };
  },
});
