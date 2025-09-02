import type { ResultStatus } from "./ResultStatus.enum.js";

export type FileResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;
export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export interface TargetCounts {
  passed: number;
  failed: number;
}

export interface FileCounts {
  passed: number;
  failed: number;
}

export interface TestCounts {
  passed: number;
  failed: number;
  skipped: number;
  fixme: number;
  todo: number;
}

export interface AssertionCounts {
  passed: number;
  failed: number;
  skipped: number;
  fixme: number;
  todo: number;
}

export type ResultCounts = AssertionCounts | TestCounts | FileCounts | TargetCounts;

export interface ResultTiming {
  start: number;
  end: number;
}
