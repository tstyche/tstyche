import type { ResultCounts } from "./ResultCounts.js";
import type { ResultTiming } from "./ResultTiming.js";

export function duration(timing: ResultTiming) {
  return timing.end - timing.start;
}

export function total(counts: ResultCounts): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}
