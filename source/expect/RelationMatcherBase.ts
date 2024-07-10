import type ts from "typescript";
import type { Assertion } from "#collect";
import type { Diagnostic } from "#diagnostic";
import type { MatchResult, Relation, TypeChecker } from "./types.js";

export abstract class RelationMatcherBase {
  protected compiler: typeof ts;
  protected abstract relation: Relation;
  protected typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.compiler = compiler;
    this.typeChecker = typeChecker;
  }

  abstract explain(
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
  ): Array<Diagnostic>;

  protected getType(node: ts.Expression | ts.TypeNode) {
    return this.compiler.isExpression(node)
      ? this.typeChecker.getTypeAtLocation(node)
      : this.typeChecker.getTypeFromTypeNode(node);
  }

  match(
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
  ): MatchResult {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    const isMatch = this.typeChecker.isTypeRelatedTo(sourceType, targetType, this.relation);

    return {
      explain: () => this.explain(assertion, sourceNode, targetNode),
      isMatch,
    };
  }
}
