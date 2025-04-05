import type ts from "typescript";
import type { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import type { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export type AbilityDiagnostic = [diagnostic: ts.Diagnostic, origin: ts.Node];

export class AssertionNode extends TestTreeNode {
  abilityDiagnostics: Set<AbilityDiagnostic> | undefined;
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
    notNode?: ts.PropertyAccessExpression,
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
      if (diagnostic.start != null && diagnostic.start >= this.source.pos && diagnostic.start <= this.source.end) {
        this.diagnostics.add(diagnostic);
        parent.diagnostics.delete(diagnostic);
      }
    }
  }
}
