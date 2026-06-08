import type ts from "typescript";
import type { Node, TypeScript } from "#typescript";

export abstract class MatcherBase {
  protected ts: TypeScript;
  protected typeChecker: ts.TypeChecker;

  constructor(ts: TypeScript, program: ts.Program) {
    this.ts = ts;
    this.typeChecker = program.getTypeChecker();
  }

  protected getType(node: Node): ts.Type {
    return this.typeChecker.getTypeAtLocation(node as ts.Node);
  }

  protected getTypeText(node: Node, typeChecker: ts.TypeChecker): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return typeChecker.typeToString(typeChecker.getTypeAtLocation(node as ts.Node));
  }
}
