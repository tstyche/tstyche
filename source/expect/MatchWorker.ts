import type ts from "typescript";
import type { AssertionNode } from "#collect";
import { DiagnosticOrigin } from "#diagnostic";
import type { Relation, TypeChecker } from "./types.js";

export class MatchWorker {
  assertion: AssertionNode;
  #compiler: typeof ts;
  #signatureCache = new Map<ts.Node, Array<ts.Signature>>();
  #typeCache = new Map<ts.Node, ts.Type>();
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, assertion: AssertionNode) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
    this.assertion = assertion;
  }

  checkHasApplicableIndexType(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    return this.#typeChecker
      .getIndexInfosOfType(sourceType)
      .some(({ keyType }) => this.#typeChecker.isApplicableIndexType(targetType, keyType));
  }

  checkHasProperty(sourceNode: ts.Node, propertyNameText: string): boolean {
    const sourceType = this.getType(sourceNode);

    return sourceType
      .getProperties()
      .some((property) => this.#compiler.unescapeLeadingUnderscores(property.escapedName) === propertyNameText);
  }

  checkIsAssignableTo(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  checkIsAssignableWith(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#checkIsRelatedTo(targetNode, sourceNode, relation);
  }

  checkIsIdenticalTo(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    const relation = this.#typeChecker.relation.identity;

    return (
      this.#checkIsRelatedTo(sourceNode, targetNode, relation) &&
      // following assignability checks ensure '{ a?: number }' and '{ a?: number | undefined }'
      // are reported as not identical when '"exactOptionalPropertyTypes": true' is set
      this.checkIsAssignableTo(sourceNode, targetNode) &&
      this.checkIsAssignableWith(sourceNode, targetNode)
    );
  }

  #checkIsRelatedTo(sourceNode: ts.Node, targetNode: ts.Node, relation: Relation) {
    const sourceType =
      relation === this.#typeChecker.relation.identity
        ? this.#simplifyType(this.getType(sourceNode))
        : this.getType(sourceNode);

    const targetType =
      relation === this.#typeChecker.relation.identity
        ? this.#simplifyType(this.getType(targetNode))
        : this.getType(targetNode);

    return this.#typeChecker.isTypeRelatedTo(sourceType, targetType, relation);
  }

  extendsObjectType(type: ts.Type): boolean {
    const nonPrimitiveType = { flags: this.#compiler.TypeFlags.NonPrimitive } as ts.Type; // the intrinsic 'object' type

    return this.#typeChecker.isTypeAssignableTo(type, nonPrimitiveType);
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
    const type = this.getType(node);

    // TODO consider passing 'enclosingDeclaration' as well
    return this.#typeChecker.typeToString(type);
  }

  getType(node: ts.Node): ts.Type {
    let type = this.#typeCache.get(node);

    if (!type) {
      type = this.#typeChecker.getTypeAtLocation(node);
    }

    return type;
  }

  isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return !!(type.flags & this.#compiler.TypeFlags.StringOrNumberLiteral);
  }

  isObjectType(type: ts.Type): type is ts.ObjectType {
    return !!(type.flags & this.#compiler.TypeFlags.Object);
  }

  isUnionType(type: ts.Type): type is ts.UnionType {
    return !!(type.flags & this.#compiler.TypeFlags.Union);
  }

  isUniqueSymbolType(type: ts.Type): type is ts.UniqueESSymbolType {
    return !!(type.flags & this.#compiler.TypeFlags.UniqueESSymbol);
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

      if (
        type.types.every((type) =>
          this.#typeChecker.isTypeRelatedTo(
            this.#simplifyType(type),
            candidateType,
            this.#typeChecker.relation.identity,
          ),
        )
      ) {
        return candidateType;
      }
    }

    return type;
  }
}
