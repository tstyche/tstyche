import type ts from "typescript";
import { diagnosticBelongsToNode } from "#diagnostic";
import type { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import type { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export class AssertionNode extends TestTreeNode {
  abilityDiagnostics = new Set<ts.Diagnostic>();
  isNot: boolean;
  matcherNode: ts.CallExpression | ts.Decorator;
  matcherNameNode: ts.PropertyAccessExpression;
  modifierNode: ts.PropertyAccessExpression;
  notNode: ts.PropertyAccessExpression | undefined;
  source: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>;
  target: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode> | undefined;

  constructor(
    compiler: typeof ts,
    brand: TestTreeNodeBrand,
    node: ts.CallExpression,
    parent: TestTree | TestTreeNode,
    flags: TestTreeNodeFlags,
    matcherNode: ts.CallExpression | ts.Decorator,
    matcherNameNode: ts.PropertyAccessExpression,
    modifierNode: ts.PropertyAccessExpression,
    notNode: ts.PropertyAccessExpression | undefined,
  ) {
    super(compiler, brand, node, parent, flags);

    this.isNot = notNode != null;
    this.matcherNode = matcherNode;
    this.matcherNameNode = matcherNameNode;
    this.modifierNode = modifierNode;
    this.source = this.node.typeArguments ?? this.node.arguments;

    if (compiler.isCallExpression(this.matcherNode)) {
      this.target = this.matcherNode.typeArguments ?? this.matcherNode.arguments;
    }

    for (const diagnostic of parent.diagnostics) {
      if (
        diagnosticBelongsToNode(diagnostic, this.source) ||
        (this.target != null && diagnosticBelongsToNode(diagnostic, this.target))
      ) {
        this.diagnostics.add(diagnostic);
        parent.diagnostics.delete(diagnostic);
      }
    }
  }
}
