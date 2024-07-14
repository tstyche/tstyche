import type ts from "typescript";
import { TestMember } from "./TestMember.js";
import type { TestTree } from "./TestTree.js";
import type { TestMemberBrand, TestMemberFlags } from "./enums.js";

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

    const argStart = this.source[0]?.getStart();
    const argEnd = this.source[0]?.getEnd();

    for (const diagnostic of parent.diagnostics) {
      if (
        diagnostic.start != null &&
        argStart != null &&
        argEnd != null &&
        diagnostic.start >= argStart &&
        diagnostic.start <= argEnd
      ) {
        this.diagnostics.add(diagnostic);
        parent.diagnostics.delete(diagnostic);
      }
    }
  }

  get matcherName(): ts.MemberName {
    return this.matcherNode.expression.name;
  }

  get source(): ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode> {
    if (this.node.typeArguments != null) {
      return this.node.typeArguments;
    }

    return this.node.arguments;
  }

  get target(): ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode> {
    if (this.matcherNode.typeArguments != null) {
      return this.matcherNode.typeArguments;
    }

    return this.matcherNode.arguments;
  }
}
