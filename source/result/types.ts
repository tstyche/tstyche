import type { ResultStatus } from "./ResultStatus.enum.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export type TargetCounts = {
  [K in Exclude<TargetResultStatus, ResultStatus.Runs>]: number;
};

export type FileResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export type FileCounts = {
  [K in Exclude<FileResultStatus, ResultStatus.Runs>]: number;
};

export type TestResultStatus =
  | ResultStatus.Runs
  | ResultStatus.Passed
  | ResultStatus.Failed
  | ResultStatus.Skipped
  | ResultStatus.Fixme
  | ResultStatus.Todo;

export type TestCounts = {
  [K in Exclude<TestResultStatus, ResultStatus.Runs>]: number;
};

export type AssertionResultStatus =
  | ResultStatus.Runs
  | ResultStatus.Passed
  | ResultStatus.Failed
  | ResultStatus.Skipped
  | ResultStatus.Fixme
  | ResultStatus.Todo;

export type AssertionCounts = {
  [K in Exclude<AssertionResultStatus, ResultStatus.Runs>]: number;
};

export type SuppressedResultStatus = ResultStatus.Matched | ResultStatus.Failed | ResultStatus.Ignored;

export type SuppressedCounts = {
  [K in SuppressedResultStatus]: number;
};

export type ResultCounts = TargetCounts | FileCounts | TestCounts | AssertionCounts | SuppressedCounts;

export interface ResultTiming {
  start: number;
  end: number;
}
