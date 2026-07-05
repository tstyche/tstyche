import type * as ts from "#typescript";

export abstract class MatcherBase {
  protected ts: ts.TypeScript;
  protected checker: ts.Checker;

  constructor(ts: ts.TypeScript, checker: ts.Checker) {
    this.ts = ts;
    this.checker = checker;
  }

  protected getType(node: ts.Node): ts.Type {
    return this.checker.getTypeAtLocation(node as any)!;
  }

  protected getTypeText(node: ts.Node): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return this.checker.typeToString(this.getType(node) as any);
  }
}
