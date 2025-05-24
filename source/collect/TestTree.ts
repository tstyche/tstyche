import type ts from "typescript";
import { Directive, type DirectiveRange, type InlineConfig } from "#config";
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

  getDirectiveRanges(compiler: typeof ts): Array<DirectiveRange> | undefined {
    return Directive.getDirectiveRanges(compiler, this.sourceFile);
  }

  async getInlineConfig(compiler: typeof ts): Promise<InlineConfig | undefined> {
    const directiveRanges = this.getDirectiveRanges(compiler);

    if (directiveRanges != null) {
      return await Directive.getInlineConfig(directiveRanges, this.sourceFile);
    }

    return;
  }
}
