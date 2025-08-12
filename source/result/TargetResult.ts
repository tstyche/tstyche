import type { FileLocation } from "#file";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TargetResult {
  files: Array<FileLocation>;
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  target: string;
  timing = new ResultTiming();

  constructor(target: string, files: Array<FileLocation>) {
    this.target = target;
    this.files = files;
  }
}
