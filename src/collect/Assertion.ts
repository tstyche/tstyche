import type ts from "typescript/lib/tsserverlibrary.js";
import { TestMember } from "./TestMember.js";
import type { TestMemberBrand } from "./TestMemberBrand.js";
import type { TestMemberFlags } from "./TestMemberFlags.js";
import type { TestTree } from "./TestTree.js";

export interface MatcherNode extends ts.CallExpression {
  expression: ts.PropertyAccessExpression;
}

// TODO try not extending after implementing 'onDiagnostics'
export class Assertion extends TestMember {
  isNot: boolean;
  override name = "";

  constructor(
    brand: TestMemberBrand,
    node: ts.CallExpression,
    parent: TestTree | TestMember,
    flags: TestMemberFlags,
    public matcherNode: MatcherNode,
    public modifierNode: ts.PropertyAccessExpression,
    public notNode: ts.PropertyAccessExpression | undefined,
  ) {
    super(brand, node, parent, flags);

    this.diagnostics = this.#mapDiagnostics();
    this.isNot = notNode ? true : false;
  }

  override get ancestorNames(): Array<string> {
    const ancestorNames: Array<string> = [];

    if ("ancestorNames" in this.parent) {
      ancestorNames.push(...this.parent.ancestorNames);
    }

    if ("name" in this.parent) {
      ancestorNames.push(this.parent.name);
    }

    return ancestorNames;
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

  #mapDiagnostics() {
    const mapped: Array<ts.Diagnostic> = [];
    const unmapped: Array<ts.Diagnostic> = [];

    let argStart: number;
    let argEnd: number;

    if (this.node.typeArguments?.[0]) {
      argStart = this.node.typeArguments[0].getStart();
      argEnd = this.node.typeArguments[0].getEnd();
    } else if (this.node.arguments[0]) {
      argStart = this.node.arguments[0].getStart();
      argEnd = this.node.arguments[0].getEnd();
    }

    this.parent.diagnostics.forEach((diagnostic) => {
      if (diagnostic.start != null && diagnostic.start >= argStart && diagnostic.start <= argEnd) {
        mapped.push(diagnostic);
      } else {
        unmapped.push(diagnostic);
      }
    });

    this.parent.diagnostics = unmapped;

    return mapped;
  }
}
