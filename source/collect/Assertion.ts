import type ts from "typescript";
import type { TaskResult } from "../result/index.js";
import { TestMember } from "./TestMember.js";
import type { TestMemberBrand } from "./TestMemberBrand.enum.js";
import type { TestMemberFlags } from "./TestMemberFlags.enum.js";
import type { TestTree } from "./TestTree.js";

export interface MatcherNode extends ts.CallExpression {
  expression: ts.PropertyAccessExpression;
}

export class Assertion extends TestMember {
  isNot: boolean;
  matcherName: ts.MemberName;
  matcherNode: MatcherNode;
  modifierNode: ts.PropertyAccessExpression;
  notNode: ts.PropertyAccessExpression | undefined;
  source: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>;
  target: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>;

  constructor(
    compiler: typeof ts,
    brand: TestMemberBrand,
    node: ts.CallExpression,
    parent: TestTree | TestMember,
    flags: TestMemberFlags,
    matcherNode: MatcherNode,
    modifierNode: ts.PropertyAccessExpression,
    notNode: ts.PropertyAccessExpression | undefined,
    parentResult: TaskResult,
  ) {
    super(compiler, brand, node, parent, flags, parentResult);

    this.isNot = notNode != null;
    this.matcherName = matcherNode.expression.name;
    this.matcherNode = matcherNode;
    this.modifierNode = modifierNode;
    this.source = this.node.typeArguments ?? this.node.arguments;
    this.target = this.matcherNode.typeArguments ?? this.matcherNode.arguments;

    for (const diagnostic of parent.diagnostics) {
      if (diagnostic.start != null && diagnostic.start >= this.source.pos && diagnostic.start <= this.source.end) {
        this.diagnostics.add(diagnostic);
        parent.diagnostics.delete(diagnostic);
      }
    }
  }
}
