import type * as tsAst from "@typescript/native-preview/unstable/ast";
import type * as tsApi from "@typescript/native-preview/unstable/sync";
import type { NamespaceImport } from "typescript";
import { BaseAdapter } from "./BaseAdapter.js";
import type {
  CallbackFunction,
  Decorator,
  ImportDeclaration,
  NamedImports,
  Node,
  ObjectLiteralExpression,
  ParenthesizedExpression,
  PropertyAssignment,
  SpreadAssignment,
  StringLiteral,
  StringLiteralLikeNode,
} from "./types.js";

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

    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4237
    this.LanguageVariant = ast.LanguageVariant;
    this.SyntaxKind = ast.SyntaxKind;
    this.TypeFlags = api.TypeFlags;
  }

  async close() {
    // await this.#cleanup();
  }

  getLeadingCommentRanges(text: string, pos: number): Array<tsAst.CommentRange> | undefined {
    return this.#ast.getLeadingCommentRanges(text, pos);
  }

  isCallbackFunction(node: Node): node is CallbackFunction {
    return this.#ast.isArrowFunction(node as tsAst.Node) || this.#ast.isFunctionExpression(node as tsAst.Node);
  }

  isDecorator(node: Node): node is Decorator {
    return this.#ast.isDecorator(node as tsAst.Node);
  }

  isImportDeclaration(node: Node): node is ImportDeclaration {
    return this.#ast.isImportDeclaration(node as tsAst.Node);
  }

  isNamespaceImport(node: Node): node is NamespaceImport {
    return this.#ast.isNamespaceImport(node as tsAst.Node);
  }

  isNamedImports(node: Node): node is NamedImports {
    return this.#ast.isNamedImports(node as tsAst.Node);
  }

  isObjectLiteralExpression(node: Node): node is ObjectLiteralExpression {
    return this.#ast.isObjectLiteralExpression(node as tsAst.Node);
  }

  isParenthesizedExpression(node: Node): node is ParenthesizedExpression {
    return this.#ast.isParenthesizedExpression(node as tsAst.Node);
  }

  isPropertyAssignment(node: Node): node is PropertyAssignment {
    return this.#ast.isPropertyAssignment(node as tsAst.Node);
  }

  isSpreadAssignment(node: Node): node is SpreadAssignment {
    return this.#ast.isSpreadAssignment(node as tsAst.Node);
  }

  isStringLiteral(node: Node): node is StringLiteral {
    return this.#ast.isStringLiteral(node as tsAst.Node);
  }

  isStringLiteralLikeNode(node: Node): node is StringLiteralLikeNode {
    return this.#ast.isStringLiteralLikeNode(node as tsAst.Node);
  }

  isTypeOnlyImportDeclaration(node: ImportDeclaration): boolean {
    return node.importClause?.phaseModifier !== this.SyntaxKind.TypeKeyword;
  }

  // TODO the '.unescapeLeadingUnderscores()' utility is missing in TS7, find out if it is needed or not
  unescapeLeadingUnderscores(identifier: any): string {
    return identifier;
  }
}
