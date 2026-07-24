import type * as tsAst from "typescript/unstable/ast";
import type * as tsVfs from "typescript/unstable/fs";
import type * as tsApi from "typescript/unstable/sync";
import type { ResolvedConfig } from "#config";
import { NativeProjectService } from "#project";
import { BaseAdapter } from "./BaseAdapter.js";
import type { CallbackFunction, ImportDeclaration, Node } from "./types.js";

export class NativeTypeScript extends BaseAdapter {
  #api: typeof tsApi;
  #ast: typeof tsAst;
  version: string;

  ElementFlags: typeof tsApi.ElementFlags;
  LanguageVariant: typeof tsAst.LanguageVariant;
  ModifierFlags: typeof tsApi.ModifierFlags;
  ObjectFlags: typeof tsApi.ObjectFlags;
  SignatureKind: typeof tsApi.SignatureKind;
  SymbolFlags: typeof tsApi.SymbolFlags;
  SyntaxKind: typeof tsAst.SyntaxKind;
  TypeFlags: typeof tsApi.TypeFlags;

  constructor(api: typeof tsApi, ast: typeof tsAst, version: string) {
    super();

    this.#api = api;
    this.#ast = ast;
    this.version = version;

    this.ElementFlags = api.ElementFlags;
    this.LanguageVariant = ast.LanguageVariant;
    this.ModifierFlags = api.ModifierFlags;
    this.ObjectFlags = api.ObjectFlags;
    this.SignatureKind = api.SignatureKind;
    this.SymbolFlags = api.SymbolFlags;
    this.SyntaxKind = ast.SyntaxKind;
    this.TypeFlags = api.TypeFlags;
  }

  getApi(fs: tsVfs.FileSystem) {
    return new this.#api.API({ fs });
  }

  getLeadingCommentRanges(text: string, pos: number): Array<tsAst.CommentRange> | undefined {
    return this.#ast.getLeadingCommentRanges(text, pos);
  }

  getProjectService(resolvedConfig: ResolvedConfig): NativeProjectService {
    return new NativeProjectService(this, resolvedConfig);
  }

  isCallbackFunction(node: Node): node is CallbackFunction {
    return this.#ast.isArrowFunction(node as tsAst.Node) || this.#ast.isFunctionExpression(node as tsAst.Node);
  }

  isTypeOnlyImportDeclaration(node: ImportDeclaration): boolean {
    return node.importClause?.phaseModifier === this.SyntaxKind.TypeKeyword;
  }
}
