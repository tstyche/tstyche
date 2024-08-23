import type { Diagnostic } from "#diagnostic";
import type { TaskResult } from "./TaskResult.js";

export class ProjectResult {
  compilerVersion: string;
  diagnostics: Array<Diagnostic> = [];
  projectConfigFilePath: string | undefined;
  results: Array<TaskResult> = [];

  constructor(compilerVersion: string, projectConfigFilePath: string | undefined) {
    this.compilerVersion = compilerVersion;
    this.projectConfigFilePath = projectConfigFilePath;
  }
}
