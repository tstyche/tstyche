import type ts6 from "typescript";
import type * as ts from "#typescript";

export abstract class MatcherBase {
  protected ts: ts.TypeScript;
  protected typeChecker: ts6.TypeChecker;

  constructor(ts: ts.TypeScript, program: ts6.Program) {
    this.ts = ts;
    this.typeChecker = program.getTypeChecker();
  }

  protected getType(node: ts.Node): ts6.Type {
    return this.typeChecker.getTypeAtLocation(node as ts6.Node);
  }

  protected getTypeText(node: ts.Node, typeChecker: ts6.TypeChecker): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return typeChecker.typeToString(typeChecker.getTypeAtLocation(node as ts6.Node));
  }
}
