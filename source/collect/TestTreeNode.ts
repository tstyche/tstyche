import type ts from "typescript";
import { Directive, type DirectiveRanges } from "#config";
import { diagnosticBelongsToNode } from "#diagnostic";
import type { ExpectNode } from "./ExpectNode.js";
import type { TestTree } from "./TestTree.js";
import type { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";
import type { WhenNode } from "./WhenNode.js";

export class TestTreeNode {
  brand: TestTreeNodeBrand;
  children: Array<TestTreeNode | ExpectNode | WhenNode> = [];
  diagnostics = new Set<ts.Diagnostic>();
  flags: TestTreeNodeFlags;
  name = "";
  node: ts.CallExpression;
  parent: TestTree | TestTreeNode;

  constructor(
    compiler: typeof ts,
    brand: TestTreeNodeBrand,
    node: ts.CallExpression,
    parent: TestTree | TestTreeNode,
    flags: TestTreeNodeFlags,
  ) {
    this.brand = brand;
    this.node = node;
    this.parent = parent;
    this.flags = flags;

    if (node.arguments[0] != null && compiler.isStringLiteralLike(node.arguments[0])) {
      this.name = node.arguments[0].text;
    }

    if (node.arguments[1] != null && compiler.isFunctionLike(node.arguments[1])) {
      for (const diagnostic of parent.diagnostics) {
        if (diagnosticBelongsToNode(diagnostic, node.arguments[1].body)) {
          this.diagnostics.add(diagnostic);

          parent.diagnostics.delete(diagnostic);
        }
      }
    }
  }

  getDirectiveRanges(compiler: typeof ts): DirectiveRanges | undefined {
    return Directive.getDirectiveRanges(compiler, this.node.getSourceFile(), this.node.getFullStart());
  }
}
