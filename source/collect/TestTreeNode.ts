import { diagnosticBelongsToNode } from "#diagnostic";
import type * as ts from "#typescript";
import type { ExpectNode } from "./ExpectNode.js";
import type { TestTree } from "./TestTree.js";
import type { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export class TestTreeNode {
  brand: TestTreeNodeBrand;
  children: Array<TestTreeNode | ExpectNode> = [];
  diagnostics = new Set<ts.Diagnostic>();
  flags: TestTreeNodeFlags;
  name = "";
  node: ts.CallExpression;
  parent: TestTree | TestTreeNode;

  constructor(
    ts: ts.TypeScript,
    brand: TestTreeNodeBrand,
    node: ts.CallExpression,
    parent: TestTree | TestTreeNode,
    flags: TestTreeNodeFlags,
  ) {
    this.brand = brand;
    this.node = node;
    this.parent = parent;
    this.flags = flags;

    if (node.arguments[0] != null && ts.isStringLiteralLikeNode(node.arguments[0])) {
      this.name = node.arguments[0].text;
    }

    if (node.arguments[1] != null && ts.isCallbackFunction(node.arguments[1])) {
      for (const diagnostic of parent.diagnostics) {
        if (node.arguments[1].body != null && diagnosticBelongsToNode(diagnostic, node.arguments[1].body)) {
          this.diagnostics.add(diagnostic);

          parent.diagnostics.delete(diagnostic);
        }
      }
    }
  }
}
