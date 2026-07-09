import type ts6 from "@typescript/typescript6";
import type { ResolvedConfig } from "#config";
import { CompatProjectService } from "#project";
import { BaseAdapter } from "./BaseAdapter.js";
import type { CallbackFunction, ImportDeclaration, Node } from "./types.js";

export class CompatTypeScript extends BaseAdapter {
  // TODO make this private after implementing all needed methods
  compiler: typeof ts6;
  version: string;

  LanguageVariant: typeof ts6.LanguageVariant;
  ModifierFlags: typeof ts6.ModifierFlags;
  ObjectFlags: typeof ts6.ObjectFlags;
  SignatureKind: typeof ts6.SignatureKind;
  SymbolFlags: typeof ts6.SymbolFlags;
  SyntaxKind: typeof ts6.SyntaxKind;
  TypeFlags: typeof ts6.TypeFlags;

  constructor(compiler: typeof ts6, version: string) {
    super();

    this.compiler = compiler;
    this.version = version;

    this.LanguageVariant = compiler.LanguageVariant;
    this.ModifierFlags = compiler.ModifierFlags;
    this.ObjectFlags = compiler.ObjectFlags;
    this.SignatureKind = compiler.SignatureKind;
    this.SymbolFlags = compiler.SymbolFlags;
    this.SyntaxKind = compiler.SyntaxKind;
    this.TypeFlags = compiler.TypeFlags;
  }

  getLeadingCommentRanges(text: string, pos: number) {
    return this.compiler.getLeadingCommentRanges(text, pos);
  }

  createProjectService(resolvedConfig: ResolvedConfig): CompatProjectService {
    return new CompatProjectService(this.compiler, resolvedConfig);
  }

  isCallbackFunction(node: Node): node is CallbackFunction {
    return this.compiler.isArrowFunction(node as ts6.Node) || this.compiler.isFunctionExpression(node as ts6.Node);
  }

  isTypeOnlyImportDeclaration(node: ImportDeclaration): boolean {
    return (node as ts6.ImportDeclaration).importClause?.isTypeOnly === true;
  }
}
