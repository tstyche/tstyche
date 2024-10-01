import type ts from "typescript";
import { TestMember } from "./TestMember.js";
import type { TestMemberBrand } from "./TestMemberBrand.enum.js";
import type { TestMemberFlags } from "./TestMemberFlags.enum.js";
import type { TestTree } from "./TestTree.js";

export interface MatcherNode extends ts.CallExpression {
  expression: ts.PropertyAccessExpression;
}

export class Assertion extends TestMember {
  isNot: boolean;
  matcherNode: MatcherNode;
  modifierNode: ts.PropertyAccessExpression;
  notNode: ts.PropertyAccessExpression | undefined;

  constructor(
    compiler: typeof ts,
    brand: TestMemberBrand,
    node: ts.CallExpression,
    parent: TestTree | TestMember,
    flags: TestMemberFlags,
    matcherNode: MatcherNode,
    modifierNode: ts.PropertyAccessExpression,
    notNode?: ts.PropertyAccessExpression,
  ) {
    super(compiler, brand, node, parent, flags);

    this.isNot = notNode != null;
    this.matcherNode = matcherNode;
    this.modifierNode = modifierNode;

    for (const diagnostic of parent.diagnostics) {
      if (diagnostic.start != null && diagnostic.start >= this.source.pos && diagnostic.start <= this.source.end) {
        this.diagnostics.add(diagnostic);
        parent.diagnostics.delete(diagnostic);
      }
    }
  }

  get matcherName(): ts.MemberName {
    return this.matcherNode.expression.name;
  }

  get source(): ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode> {
    return this.node.typeArguments ?? this.node.arguments;
  }

  get target(): ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode> {
    return this.matcherNode.typeArguments ?? this.matcherNode.arguments;
  }
}
