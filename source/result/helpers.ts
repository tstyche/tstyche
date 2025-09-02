import type { AssertionCounts, FileCounts, ResultCounts, ResultTiming, TargetCounts, TestCounts } from "./types.js";

function createObjectFromKeys<T extends string, U>(keys: Array<T>, defaultValue: U): Record<T, U> {
  return Object.fromEntries(keys.map((key) => [key, defaultValue])) as Record<T, U>;
}

export function createTargetCounts(): TargetCounts {
  return createObjectFromKeys(["failed", "passed"], 0);
}

export function createFileCounts(): FileCounts {
  return createObjectFromKeys(["failed", "passed"], 0);
}

export function createTestCounts(): TestCounts {
  return createObjectFromKeys(["failed", "passed", "skipped", "fixme", "todo"], 0);
}

export function createAssertionCounts(): AssertionCounts {
  return createObjectFromKeys(["failed", "passed", "skipped", "fixme", "todo"], 0);
}

export function createResultTiming(): ResultTiming {
  return createObjectFromKeys(["start", "end"], Number.NaN);
}

export function duration(timing: ResultTiming) {
  return timing.end - timing.start;
}

export function total(counts: ResultCounts): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}
