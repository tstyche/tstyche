import type ts from "typescript";
import type { AssertionNode } from "#collect";
import { DiagnosticOrigin } from "#diagnostic";
import { Relation } from "./Relation.enum.js";
import type { TypeChecker } from "./types.js";

export class MatchWorker {
  assertion: AssertionNode;
  #compiler: typeof ts;
  #signatureCache = new Map<ts.Node, Array<ts.Signature>>();
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, assertion: AssertionNode) {
    this.#compiler = compiler;
    this.typeChecker = typeChecker;
    this.assertion = assertion;
  }

  checkHasApplicableIndexType(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    return this.typeChecker
      .getIndexInfosOfType(sourceType)
      .some(({ keyType }) => this.typeChecker.isApplicableIndexType(targetType, keyType));
  }

  checkHasProperty(sourceNode: ts.Node, propertyNameText: string): boolean {
    const sourceType = this.getType(sourceNode);

    return sourceType
      .getProperties()
      .some((property) => this.#compiler.unescapeLeadingUnderscores(property.escapedName) === propertyNameText);
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
    const nonPrimitiveType = { flags: this.#compiler.TypeFlags.NonPrimitive } as ts.Type; // the intrinsic 'object' type

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
      return DiagnosticOrigin.fromNode(symbol.valueDeclaration.name, this.assertion);
    }

    return DiagnosticOrigin.fromNode(enclosingNode, this.assertion);
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
