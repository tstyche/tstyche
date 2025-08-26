import type { FileLocation } from "#file";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultStatusFlags } from "./ResultStatusFlags.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export type TargetResultStatusFlags = ResultStatusFlags.Runs | ResultStatusFlags.Passed | ResultStatusFlags.Failed;

export class TargetResult {
  files: Array<FileLocation>;
  results = new Map<string | undefined, ProjectResult>();
  status: ResultStatusFlags = ResultStatusFlags.Runs;
  target: string;
  timing = new ResultTiming();

  constructor(target: string, files: Array<FileLocation>) {
    this.target = target;
    this.files = files;
  }
}
