import type { ProjectConfig } from "#project";
import type { FileResult } from "./FileResult.js";

export class ProjectResult {
  compilerVersion: string;
  projectConfig: ProjectConfig;
  results: Array<FileResult> = [];

  constructor(compilerVersion: string, projectConfig: ProjectConfig) {
    this.compilerVersion = compilerVersion;
    this.projectConfig = projectConfig;
  }
}
