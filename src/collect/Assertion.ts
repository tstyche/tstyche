import type ts from "typescript/lib/tsserverlibrary.js";
import { AssertionSource } from "./AssertionSource.js";
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

  get sourceArguments(): ts.NodeArray<ts.Expression> {
    return this.node.arguments;
  }

  get sourceType(): { position: { end: number; start: number }; source: AssertionSource; type: ts.Type } | undefined {
    if (!this.typeChecker) {
      return;
    }

    if (this.node.typeArguments?.[0]) {
      return {
        position: {
          end: this.node.typeArguments[0].getEnd(),
          start: this.node.typeArguments[0].getStart(),
        },
        source: AssertionSource.TypeArgument,
        type: this.typeChecker.getTypeFromTypeNode(this.node.typeArguments[0]),
      };
    }

    if (this.node.arguments[0]) {
      return {
        position: {
          end: this.node.arguments[0].getEnd(),
          start: this.node.arguments[0].getStart(),
        },
        source: AssertionSource.Argument,
        type: this.typeChecker.getTypeAtLocation(this.node.arguments[0]),
      };
    }

    return;
  }

  get targetArguments(): ts.NodeArray<ts.Expression> {
    return this.matcherNode.arguments;
  }

  get targetType(): { position: { end: number; start: number }; source: AssertionSource; type: ts.Type } | undefined {
    if (!this.typeChecker) {
      return;
    }

    if (this.matcherNode.typeArguments?.[0]) {
      return {
        position: {
          end: this.matcherNode.typeArguments[0].getEnd(),
          start: this.matcherNode.typeArguments[0].getStart(),
        },
        source: AssertionSource.TypeArgument,
        type: this.typeChecker.getTypeFromTypeNode(this.matcherNode.typeArguments[0]),
      };
    }

    if (this.matcherNode.arguments[0]) {
      return {
        position: {
          end: this.matcherNode.arguments[0].getEnd(),
          start: this.matcherNode.arguments[0].getStart(),
        },
        source: AssertionSource.Argument,
        type: this.typeChecker.getTypeAtLocation(this.matcherNode.arguments[0]),
      };
    }

    return;
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
