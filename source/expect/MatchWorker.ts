import type ts from "typescript";
import type { Assertion } from "#collect";
import { DiagnosticOrigin } from "#diagnostic";
import { Version } from "#version";
import type { ArgumentNode, Relation, TypeChecker } from "./types.js";

export class MatchWorker {
  assertion: Assertion;
  #compiler: typeof ts;
  #signatureCache = new Map<ts.Node, Array<ts.Signature>>();
  #typeCache = new Map<ts.Node, ts.Type>();
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, assertion: Assertion) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
    this.assertion = assertion;
  }

  checkHasApplicableIndexType(sourceNode: ArgumentNode, targetNode: ArgumentNode): boolean {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    // behavior of index signatures changed since TypeScript 4.4
    if (Version.isSatisfiedWith(this.#compiler.version, "4.4")) {
      return this.#typeChecker
        .getIndexInfosOfType(sourceType)
        .some(({ keyType }) => this.#typeChecker.isApplicableIndexType(targetType, keyType));
    }

    if (targetType.flags & this.#compiler.TypeFlags.StringLiteral) {
      return sourceType.getStringIndexType() != null;
    }

    if (targetType.flags & this.#compiler.TypeFlags.NumberLiteral) {
      return (sourceType.getStringIndexType() ?? sourceType.getNumberIndexType()) != null;
    }

    return false;
  }

  checkHasProperty(sourceNode: ArgumentNode, propertyNameText: string): boolean {
    const sourceType = this.getType(sourceNode);

    return sourceType
      .getProperties()
      .some((property) => this.#compiler.unescapeLeadingUnderscores(property.escapedName) === propertyNameText);
  }

  checkIsAssignableTo(sourceNode: ArgumentNode, targetNode: ArgumentNode): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  checkIsAssignableWith(sourceNode: ArgumentNode, targetNode: ArgumentNode): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#checkIsRelatedTo(targetNode, sourceNode, relation);
  }

  checkIsIdenticalTo(sourceNode: ArgumentNode, targetNode: ArgumentNode): boolean {
    const relation = this.#typeChecker.relation.identity;

    return (
      this.#checkIsRelatedTo(sourceNode, targetNode, relation) &&
      // following assignability checks ensure '{ a?: number }' and '{ a?: number | undefined }'
      // are reported as not identical when '"exactOptionalPropertyTypes": true' is set
      this.checkIsAssignableTo(sourceNode, targetNode) &&
      this.checkIsAssignableWith(sourceNode, targetNode)
    );
  }

  checkIsSubtype(sourceNode: ArgumentNode, targetNode: ArgumentNode): boolean {
    const relation = this.#typeChecker.relation.subtype;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  #checkIsRelatedTo(sourceNode: ArgumentNode, targetNode: ArgumentNode, relation: Relation) {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    let result = this.#typeChecker.isTypeRelatedTo(sourceType, targetType, relation);

    // expect<{ a: string } | { a: string }>().type.toBe<{ a: string }>();
    if (!result && relation === this.#typeChecker.relation.identity && sourceType.isUnion()) {
      result = sourceType.types.every((type) => this.#typeChecker.isTypeRelatedTo(type, targetType, relation));
    }

    return result;
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

    return this.#getTypeOfNode(parameter);
  }

  getSignatures(node: ArgumentNode): Array<ts.Signature> {
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

  getTypeText(node: ArgumentNode): string {
    const type = this.getType(node);

    // TODO consider passing 'enclosingDeclaration' as well
    return this.#typeChecker.typeToString(type);
  }

  getType(node: ArgumentNode): ts.Type {
    return this.#compiler.isExpression(node) ? this.#getTypeOfNode(node) : this.#getTypeOfTypeNode(node);
  }

  #getTypeOfNode(node: ts.Node) {
    let type = this.#typeCache.get(node);

    if (!type) {
      type = this.#typeChecker.getTypeAtLocation(node);
    }

    return type;
  }

  #getTypeOfTypeNode(node: ts.TypeNode) {
    let type = this.#typeCache.get(node);

    if (!type) {
      type = this.#typeChecker.getTypeFromTypeNode(node);
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
}
