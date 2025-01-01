import type { Diagnostic } from "#diagnostic";
import type { TargetResult } from "./TargetResult.js";
import type { TaskResult } from "./TaskResult.js";

export class ProjectResult {
  compilerVersion: string;
  diagnostics: Array<Diagnostic> = [];
  parent: TargetResult;
  projectConfigFilePath: string | undefined;
  results: Array<TaskResult> = [];

  constructor(compilerVersion: string, projectConfigFilePath: string | undefined, parent: TargetResult) {
    this.compilerVersion = compilerVersion;
    this.parent = parent;
    this.projectConfigFilePath = projectConfigFilePath;
  }
}
