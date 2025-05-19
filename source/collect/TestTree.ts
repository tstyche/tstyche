import type ts from "typescript";
import type { DirectiveRange } from "#config";
import type { AssertionNode } from "./AssertionNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";
import type { WhenNode } from "./WhenNode.js";

export class TestTree {
  children: Array<TestTreeNode | AssertionNode | WhenNode> = [];
  diagnostics: Set<ts.Diagnostic>;
  directiveRanges: Array<DirectiveRange> | undefined;
  hasOnly = false;
  sourceFile: ts.SourceFile;

  constructor(
    diagnostics: Set<ts.Diagnostic>,
    sourceFile: ts.SourceFile,
    directiveRanges: Array<DirectiveRange> | undefined,
  ) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
    this.directiveRanges = directiveRanges;
  }
}
