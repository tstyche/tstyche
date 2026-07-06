import type * as ts from "#typescript";

export abstract class BaseCheckerAdapter {
  abstract checker: any;

  getType(node: ts.Node): ts.Type {
    return this.checker.getTypeAtLocation(node);
  }

  getTypeText(node: ts.Node): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return this.checker.typeToString(this.getType(node));
  }

  isTypeAssignableTo(source: ts.Type, target: ts.Type): boolean {
    return this.checker.isTypeAssignableTo(source, target);
  }
}
