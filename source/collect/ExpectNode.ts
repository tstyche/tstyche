import type ts from "typescript";
import { diagnosticBelongsToNode } from "#diagnostic";
import type {
  CallExpression,
  Decorator,
  Expression,
  NodeArray,
  PropertyAccessExpression,
  TypeNode,
  TypeScript,
} from "#typescript";
import type { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import type { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export class ExpectNode extends TestTreeNode {
  abilityDiagnostics = new Set<ts.Diagnostic>();
  isNot: boolean;
  matcherNode: CallExpression | Decorator;
  matcherNameNode: PropertyAccessExpression;
  modifierNode: PropertyAccessExpression;
  notNode: PropertyAccessExpression | undefined;
  source: NodeArray<Expression> | NodeArray<TypeNode>;
  target: NodeArray<Expression> | NodeArray<TypeNode> | undefined;

  constructor(
    ts: TypeScript,
    brand: TestTreeNodeBrand,
    node: CallExpression,
    parent: TestTree | TestTreeNode,
    flags: TestTreeNodeFlags,
    matcherNode: CallExpression | Decorator,
    matcherNameNode: PropertyAccessExpression,
    modifierNode: PropertyAccessExpression,
    notNode: PropertyAccessExpression | undefined,
  ) {
    super(ts, brand, node, parent, flags);

    this.isNot = notNode != null;
    this.matcherNode = matcherNode;
    this.matcherNameNode = matcherNameNode;
    this.modifierNode = modifierNode;
    this.source = this.node.typeArguments ?? this.node.arguments;

    if (ts.isCallExpression(this.matcherNode)) {
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
