import type { Checker } from "#checker";
import type { SuppressedError } from "#layers";
import type { ProjectService } from "#project";
import type * as ts from "#typescript";
import type { ExpectNode } from "./ExpectNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";

export class TestTree {
  children: Array<TestTreeNode | ExpectNode> = [];
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  program: ts.Program;
  checker: Checker;
  sourceFile: ts.SourceFile;
  suppressedErrors: Array<SuppressedError> | undefined;

  constructor(projectService: ProjectService, sourceFile: ts.SourceFile, diagnostics: Set<ts.Diagnostic>) {
    this.sourceFile = sourceFile;
    this.diagnostics = diagnostics;

    this.checker = projectService.getChecker();
    this.program = projectService.getProgram();
  }
}
