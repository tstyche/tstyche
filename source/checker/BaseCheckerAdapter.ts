import type * as ts from "#typescript";

export abstract class BaseCheckerAdapter {
  abstract checker: any;
  abstract ts: any;

  isOptionalProperty(symbol: ts.Symbol): boolean {
    return !!(symbol.flags & this.ts.SymbolFlags.Optional);
  }

  getProperties(type: ts.Type): ReadonlyArray<ts.Symbol> {
    return this.checker.getPropertiesOfType(type);
  }

  getType(node: ts.Node): ts.Type {
    return this.checker.getTypeAtLocation(node);
  }

  getTypeText(node: ts.Node): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return this.checker.typeToString(this.getType(node));
  }

  getTypeArguments(type: ts.TypeReference): ReadonlyArray<ts.Type> {
    return this.checker.getTypeArguments(type);
  }

  hasCallSignatures(type: ts.Type): boolean {
    return this.checker.getSignaturesOfType(type, this.ts.SignatureKind.Call).length > 0;
  }

  hasConstructSignatures(type: ts.Type): boolean {
    return this.checker.getSignaturesOfType(type, this.ts.SignatureKind.Construct).length > 0;
  }

  isTupleType(type: ts.Type): type is ts.TupleTypeReference {
    return this.checker.isTupleType(type);
  }

  isTypeAssignableTo(source: ts.Type, target: ts.Type): boolean {
    return this.checker.isTypeAssignableTo(source, target);
  }
}
