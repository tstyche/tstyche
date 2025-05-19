import type ts from "typescript";
import { diagnosticBelongsToNode } from "#diagnostic";
import type { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import type { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export class WhenNode extends TestTreeNode {
  actionNode: ts.CallExpression;
  actionNameNode: ts.PropertyAccessExpression;
  abilityDiagnostics: Set<ts.Diagnostic> | undefined;
  target: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>;

  constructor(
    compiler: typeof ts,
    brand: TestTreeNodeBrand,
    node: ts.CallExpression,
    parent: TestTree | TestTreeNode,
    flags: TestTreeNodeFlags,
    actionNode: ts.CallExpression,
    actionNameNode: ts.PropertyAccessExpression,
  ) {
    super(compiler, brand, node, parent, flags);

    this.actionNode = actionNode;
    this.actionNameNode = actionNameNode;

    this.target = this.node.typeArguments ?? this.node.arguments;

    for (const diagnostic of parent.diagnostics) {
      if (diagnosticBelongsToNode(diagnostic, node)) {
        this.diagnostics.add(diagnostic);
        parent.diagnostics.delete(diagnostic);
      }
    }
  }
}
