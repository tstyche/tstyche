import type ts from "typescript";
import type { InlineConfig } from "#config";
import type { AssertionNode } from "./AssertionNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";
import type { WhenNode } from "./WhenNode.js";

export class TestTree {
  children: Array<TestTreeNode | AssertionNode | WhenNode> = [];
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  inlineConfig: InlineConfig | undefined;
  sourceFile: ts.SourceFile;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile, inlineConfig: InlineConfig | undefined) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
    this.inlineConfig = inlineConfig;
  }
}
