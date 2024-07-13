import type ts from "typescript";
import type { Assertion } from "#collect";
import type { Relation, TypeChecker } from "./types.js";

export class MatchWorker {
  assertion: Assertion;
  #compiler: typeof ts;
  #typeCache = new Map<ts.Expression | ts.TypeNode, ts.Type>();
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, assertion: Assertion) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
    this.assertion = assertion;
  }

  checkIsAssignableTo(sourceNode: ts.Expression | ts.TypeNode, targetNode: ts.Expression | ts.TypeNode): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  checkIsAssignableWith(sourceNode: ts.Expression | ts.TypeNode, targetNode: ts.Expression | ts.TypeNode): boolean {
    const relation = this.#typeChecker.relation.assignable;

    return this.#checkIsRelatedTo(targetNode, sourceNode, relation);
  }

  checkIsIdenticalTo(sourceNode: ts.Expression | ts.TypeNode, targetNode: ts.Expression | ts.TypeNode): boolean {
    const relation = this.#typeChecker.relation.identity;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  checkIsSubtype(sourceNode: ts.Expression | ts.TypeNode, targetNode: ts.Expression | ts.TypeNode): boolean {
    const relation = this.#typeChecker.relation.subtype;

    return this.#checkIsRelatedTo(sourceNode, targetNode, relation);
  }

  #checkIsRelatedTo(
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
    relation: Relation,
  ) {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    return this.#typeChecker.isTypeRelatedTo(sourceType, targetType, relation);
  }

  extendsObjectType(type: ts.Type): type is ts.ObjectType {
    const nonPrimitiveType = { flags: this.#compiler.TypeFlags.NonPrimitive } as ts.Type; // the intrinsic 'object' type

    return this.#typeChecker.isTypeAssignableTo(type, nonPrimitiveType);
  }

  getTypeText(node: ts.Expression | ts.TypeNode): string {
    const type = this.getType(node);

    return this.#typeChecker.typeToString(type);
  }

  getType(node: ts.Expression | ts.TypeNode): ts.Type {
    let type = this.#typeCache.get(node);

    if (!type) {
      type = this.#compiler.isExpression(node)
        ? this.#typeChecker.getTypeAtLocation(node)
        : this.#typeChecker.getTypeFromTypeNode(node);

      this.#typeCache.set(node, type);
    }

    return type;
  }

  isAnyOrNeverType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & (this.#compiler.TypeFlags.Any | this.#compiler.TypeFlags.Never));
  }

  isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.#compiler.TypeFlags.StringOrNumberLiteral);
  }

  isUniqueSymbolType(type: ts.Type): type is ts.UniqueESSymbolType {
    return Boolean(type.flags & this.#compiler.TypeFlags.UniqueESSymbol);
  }
}
