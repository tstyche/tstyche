import type ts from "typescript";
import type { AssertionNode } from "./AssertionNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";
import type { SuppressedError } from "./types.js";
import type { WhenNode } from "./WhenNode.js";

export class TestTree {
  children: Array<TestTreeNode | AssertionNode | WhenNode> = [];
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  sourceFile: ts.SourceFile;
  suppressedErrors: Array<SuppressedError> | undefined;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
  }
}
