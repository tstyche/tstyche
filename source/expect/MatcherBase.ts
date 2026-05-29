import type ts from "typescript";

export abstract class MatcherBase {
  protected compiler: typeof ts;
  protected typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, program: ts.Program) {
    this.compiler = compiler;
    this.typeChecker = program.getTypeChecker();
  }

  protected getType(node: ts.Node): ts.Type {
    return this.typeChecker.getTypeAtLocation(node);
  }

  protected getTypeText(node: ts.Node, typeChecker: ts.TypeChecker): string {
    // TODO consider passing 'enclosingDeclaration' as well
    return typeChecker.typeToString(typeChecker.getTypeAtLocation(node));
  }
}
