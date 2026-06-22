import type * as tsAst from "typescript/unstable/ast";
import type * as tsApi from "typescript/unstable/sync";
import { BaseAdapter } from "./BaseAdapter.js";
import type { CallbackFunction, ImportDeclaration, Node } from "./types.js";

export class NativeTypeScript extends BaseAdapter {
  #ast: typeof tsAst;
  version: string;

  LanguageVariant: typeof tsAst.LanguageVariant;
  SyntaxKind: typeof tsAst.SyntaxKind;
  TypeFlags: typeof tsApi.TypeFlags;

  constructor(api: typeof tsApi, ast: typeof tsAst, version: string) {
    super();

    this.#ast = ast;
    this.version = version;

    this.LanguageVariant = ast.LanguageVariant;
    this.SyntaxKind = ast.SyntaxKind;
    this.TypeFlags = api.TypeFlags;
  }

  override async close() {
    // await this.#cleanup();
  }

  getLeadingCommentRanges(text: string, pos: number): Array<tsAst.CommentRange> | undefined {
    return this.#ast.getLeadingCommentRanges(text, pos);
  }

  isCallbackFunction(node: Node): node is CallbackFunction {
    return this.#ast.isArrowFunction(node as tsAst.Node) || this.#ast.isFunctionExpression(node as tsAst.Node);
  }

  isTypeOnlyImportDeclaration(node: ImportDeclaration): boolean {
    return node.importClause?.phaseModifier === this.SyntaxKind.TypeKeyword;
  }
}
