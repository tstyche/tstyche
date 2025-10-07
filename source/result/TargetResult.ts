import type { FileLocation } from "#file";
import { createResultTiming } from "./helpers.js";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import type { TargetResultStatus } from "./types.js";

export class TargetResult {
  files: Array<FileLocation>;
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  target: string;
  timing = createResultTiming();

  constructor(target: string, files: Array<FileLocation>) {
    this.target = target;
    this.files = files;
  }
}
