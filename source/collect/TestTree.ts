import type ts from "typescript";
import { Directive, type DirectiveRanges } from "#config";
import type { AssertionNode } from "./AssertionNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";
import type { WhenNode } from "./WhenNode.js";

export class TestTree {
  children: Array<TestTreeNode | AssertionNode | WhenNode> = [];
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  sourceFile: ts.SourceFile;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
  }

  getDirectiveRanges(compiler: typeof ts): DirectiveRanges | undefined {
    return Directive.getDirectiveRanges(compiler, this.sourceFile);
  }
}
