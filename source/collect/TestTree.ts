import type ts from "typescript";
import type { SuppressedError } from "#layers";
import type { ExpectNode } from "./ExpectNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";

export class TestTree {
  children: Array<TestTreeNode | ExpectNode> = [];
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  sourceFile: ts.SourceFile;
  suppressedErrors: Array<SuppressedError> | undefined;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
  }
}
