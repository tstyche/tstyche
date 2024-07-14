import type ts from "typescript";
import type { Assertion } from "#collect";
import { DiagnosticOrigin } from "#diagnostic";
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

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  checkIsSubtype(sourceNode: ArgumentNode, targetNode: ArgumentNode): boolean {
    const relation = this.#typeChecker.relation.subtype;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  #checkIsRelatedTo(sourceNode: ArgumentNode, targetNode: ArgumentNode, relation: Relation) {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

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

  isAnyOrNeverType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & (this.#compiler.TypeFlags.Any | this.#compiler.TypeFlags.Never));
  }

  isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.#compiler.TypeFlags.StringOrNumberLiteral);
  }

  isObjectType(type: ts.Type): type is ts.ObjectType {
    return Boolean(type.flags & this.#compiler.TypeFlags.Object);
  }

  isUnionType(type: ts.Type): type is ts.UnionType {
    return Boolean(type.flags & this.#compiler.TypeFlags.Union);
  }

  isUniqueSymbolType(type: ts.Type): type is ts.UniqueESSymbolType {
    return Boolean(type.flags & this.#compiler.TypeFlags.UniqueESSymbol);
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
