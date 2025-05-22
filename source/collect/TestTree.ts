import type ts from "typescript";
import { Directive, type DirectiveRange, type InlineConfig } from "#config";
import type { AssertionNode } from "./AssertionNode.js";
import type { TestTreeNode } from "./TestTreeNode.js";
import type { WhenNode } from "./WhenNode.js";

export class TestTree {
  children: Array<TestTreeNode | AssertionNode | WhenNode> = [];
  #compiler: typeof ts;
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  sourceFile: ts.SourceFile;

  constructor(compiler: typeof ts, diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile) {
    this.#compiler = compiler;
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
  }

  getDirectiveRanges(): Array<DirectiveRange> | undefined {
    return Directive.getDirectiveRanges(this.#compiler, this.sourceFile);
  }

  async getInlineConfig(): Promise<InlineConfig | undefined> {
    const directiveRanges = this.getDirectiveRanges();

    if (directiveRanges != null) {
      return await Directive.getInlineConfig(directiveRanges, this.sourceFile);
    }

    return;
  }
}
