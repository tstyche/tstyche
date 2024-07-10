import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { Relation, TypeChecker } from "./types.js";

export class MatchWorker {
  assertion: Assertion;
  #compiler: typeof ts;
  sourceNode: ts.Expression | ts.TypeNode;
  #sourceType: ts.Type | undefined;
  #targetType: ts.Type | undefined;
  targetNode: ts.Expression | ts.TypeNode;
  #typeChecker: TypeChecker;

  constructor(
    compiler: typeof ts,
    typeChecker: TypeChecker,
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
  ) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;

    this.assertion = assertion;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
  }

  get targetNodeOrigin(): DiagnosticOrigin {
    return DiagnosticOrigin.fromNode(this.targetNode, this.assertion);
  }

  get sourceType(): ts.Type {
    if (!this.#sourceType) {
      this.#sourceType = this.#getType(this.sourceNode);
    }

    return this.#sourceType;
  }

  get sourceTypeText(): string {
    return this.#typeChecker.typeToString(this.sourceType);
  }

  get targetType(): ts.Type {
    if (!this.#targetType) {
      this.#targetType = this.#getType(this.targetNode);
    }

    return this.#targetType;
  }

  get targetTypeText(): string {
    return this.#typeChecker.typeToString(this.targetType);
  }

  #getType(node: ts.Expression | ts.TypeNode) {
    return this.#compiler.isExpression(node)
      ? this.#typeChecker.getTypeAtLocation(node)
      : this.#typeChecker.getTypeFromTypeNode(node);
  }

  checkDoesMatch(): boolean {
    return this.#checkIsRelatedTo(this.#typeChecker.relation.subtype);
  }

  checkIsIdenticalTo(): boolean {
    return this.#checkIsRelatedTo(this.#typeChecker.relation.identity);
  }

  checkIsAssignableTo(): boolean {
    return this.#checkIsRelatedTo(this.#typeChecker.relation.assignable);
  }

  checkIsAssignableWith(): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#typeChecker.isTypeRelatedTo(this.targetType, this.sourceType, relation);
  }

  #checkIsRelatedTo(relation: Relation) {
    return this.#typeChecker.isTypeRelatedTo(this.sourceType, this.targetType, relation);
  }

  explainDoesMatch(): Array<Diagnostic> {
    const text = this.assertion.isNot
      ? ExpectDiagnosticText.typeDoesMatch(this.sourceTypeText, this.targetTypeText)
      : ExpectDiagnosticText.typeDoesNotMatch(this.sourceTypeText, this.targetTypeText);

    return [Diagnostic.error(text, this.targetNodeOrigin)];
  }

  explainIsIdenticalTo(): Array<Diagnostic> {
    const text = this.assertion.isNot
      ? ExpectDiagnosticText.typeIsIdenticalTo(this.sourceTypeText, this.targetTypeText)
      : ExpectDiagnosticText.typeIsNotIdenticalTo(this.sourceTypeText, this.targetTypeText);

    return [Diagnostic.error(text, this.targetNodeOrigin)];
  }

  explainIsAssignableTo(): Array<Diagnostic> {
    const text = this.assertion.isNot
      ? ExpectDiagnosticText.typeIsAssignableTo(this.sourceTypeText, this.targetTypeText)
      : ExpectDiagnosticText.typeIsNotAssignableTo(this.sourceTypeText, this.targetTypeText);

    return [Diagnostic.error(text, this.targetNodeOrigin)];
  }

  explainIsAssignableWith(): Array<Diagnostic> {
    const text = this.assertion.isNot
      ? ExpectDiagnosticText.typeIsAssignableWith(this.sourceTypeText, this.targetTypeText)
      : ExpectDiagnosticText.typeIsNotAssignableWith(this.sourceTypeText, this.targetTypeText);

    return [Diagnostic.error(text, this.targetNodeOrigin)];
  }
}
