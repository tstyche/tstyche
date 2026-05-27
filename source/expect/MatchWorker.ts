import type ts from "typescript";
import type { ExpectNode } from "#collect";

export class MatchWorker {
  assertionNode: ExpectNode;
  #compiler: typeof ts;
  typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, program: ts.Program, assertionNode: ExpectNode) {
    this.#compiler = compiler;
    this.typeChecker = program.getTypeChecker();
    this.assertionNode = assertionNode;
  }

  checkIsAssignableFrom(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return this.#checkIsRelatedTo(targetNode, sourceNode);
  }

  checkIsAssignableTo(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return this.#checkIsRelatedTo(sourceNode, targetNode);
  }

  #checkIsRelatedTo(sourceNode: ts.Node, targetNode: ts.Node) {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    return this.typeChecker.isTypeAssignableTo(sourceType, targetType);
  }

  extendsObjectType(type: ts.Type): boolean {
    const nonPrimitiveType =
      "getNonPrimitiveType" in this.typeChecker
        ? this.typeChecker.getNonPrimitiveType()
        : ({ flags: this.#compiler.TypeFlags.NonPrimitive } as ts.Type); // TODO remove this workaround after dropping support for TypeScript 5.8

    return this.typeChecker.isTypeAssignableTo(type, nonPrimitiveType);
  }

  getTypeText(node: ts.Node): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return this.typeChecker.typeToString(this.getType(node));
  }

  getType(node: ts.Node): ts.Type {
    return this.typeChecker.getTypeAtLocation(node);
  }
}
