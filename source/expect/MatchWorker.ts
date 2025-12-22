import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { DiagnosticOrigin } from "#diagnostic";

export class MatchWorker {
  assertionNode: ExpectNode;
  #compiler: typeof ts;
  #signatureCache = new Map<ts.Node, Array<ts.Signature>>();
  typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, program: ts.Program, assertionNode: ExpectNode) {
    this.#compiler = compiler;
    this.typeChecker = program.getTypeChecker();
    this.assertionNode = assertionNode;
  }

  checkIsAssignableTo(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return this.#checkIsRelatedTo(sourceNode, targetNode);
  }

  checkIsAssignableWith(sourceNode: ts.Node, targetNode: ts.Node): boolean {
    return this.#checkIsRelatedTo(targetNode, sourceNode);
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
}
