import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { DiagnosticOrigin } from "#diagnostic";
import { Relation } from "./Relation.enum.js";

type TypeChecker = ts.TypeChecker & { isTypeIdenticalTo(source: ts.Type, target: ts.Type): boolean };

export class MatchWorker {
  assertionNode: ExpectNode;
  #compiler: typeof ts;
  #signatureCache = new Map<ts.Node, Array<ts.Signature>>();
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, program: ts.Program, assertionNode: ExpectNode) {
    this.#compiler = compiler;
    this.typeChecker = program.getTypeChecker() as TypeChecker;
    this.assertionNode = assertionNode;
  }

  checkIsAssignableTo(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return this.#checkIsRelatedTo(sourceNode, targetNode, Relation.Assignable);
  }

  checkIsAssignableWith(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return this.#checkIsRelatedTo(targetNode, sourceNode, Relation.Assignable);
  }

  checkIsIdenticalTo(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return (
      this.#checkIsRelatedTo(sourceNode, targetNode, Relation.Identical) &&
      // following assignability checks ensure '{ a?: number }' and '{ a?: number | undefined }'
      // are reported as not identical when '"exactOptionalPropertyTypes": true' is set
      this.checkIsAssignableTo(sourceNode, targetNode) &&
      this.checkIsAssignableWith(sourceNode, targetNode)
    );
  }

  #checkIsRelatedTo(sourceNode: ts.Node, targetNode: ts.Node, relation: Relation) {
    const sourceType =
      relation === "identical" ? this.#simplifyType(this.getType(sourceNode)) : this.getType(sourceNode);

    const targetType =
      relation === "identical" ? this.#simplifyType(this.getType(targetNode)) : this.getType(targetNode);

    switch (relation) {
      case Relation.Assignable:
        return this.typeChecker.isTypeAssignableTo(sourceType, targetType);
      case Relation.Identical:
        return this.typeChecker.isTypeIdenticalTo(sourceType, targetType);
    }
  }

  extendsObjectType(type: ts.Type): boolean {
    const nonPrimitiveType =
      "getNonPrimitiveType" in this.typeChecker
        ? this.typeChecker.getNonPrimitiveType()
        : ({ flags: this.#compiler.TypeFlags.NonPrimitive } as ts.Type); // TODO remove this workaround after dropping support for TypeScript 5.8

    return this.typeChecker.isTypeAssignableTo(type, nonPrimitiveType);
  }

  getParameterType(signature: ts.Signature, index: number): ts.Type | undefined {
    const parameter = signature.getDeclaration().parameters[index];

    if (!parameter) {
      return;
    }

    return this.getType(parameter);
  }

  getSignatures(node: ts.Node): Array<ts.Signature> {
    let signatures = this.#signatureCache.get(node);

    if (!signatures) {
      const type = this.getType(node);

      signatures = type.getCallSignatures() as Array<ts.Signature>;

      if (signatures.length === 0) {
        signatures = type.getConstructSignatures() as Array<ts.Signature>;
      }
    }

    return signatures;
  }

  getTypeText(node: ts.Node): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return this.typeChecker.typeToString(this.getType(node));
  }

  getType(node: ts.Node): ts.Type {
    return this.typeChecker.getTypeAtLocation(node);
  }

  resolveDiagnosticOrigin(symbol: ts.Symbol, enclosingNode: ts.Node) {
    if (
      symbol.valueDeclaration != null &&
      (this.#compiler.isPropertySignature(symbol.valueDeclaration) ||
        this.#compiler.isPropertyAssignment(symbol.valueDeclaration) ||
        this.#compiler.isShorthandPropertyAssignment(symbol.valueDeclaration)) &&
      symbol.valueDeclaration.getStart() >= enclosingNode.getStart() &&
      symbol.valueDeclaration.getEnd() <= enclosingNode.getEnd()
    ) {
      return DiagnosticOrigin.fromNode(symbol.valueDeclaration.name, this.assertionNode);
    }

    return DiagnosticOrigin.fromNode(enclosingNode, this.assertionNode);
  }

  #simplifyType(type: ts.Type): ts.Type {
    if (type.isUnionOrIntersection()) {
      // biome-ignore lint/style/noNonNullAssertion: intersections or unions have at least two members
      const candidateType = this.#simplifyType(type.types[0]!);

      if (type.types.every((type) => this.typeChecker.isTypeIdenticalTo(this.#simplifyType(type), candidateType))) {
        return candidateType;
      }
    }

    return type;
  }
}
