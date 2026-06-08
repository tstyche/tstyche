import type ts6 from "typescript";
import { BaseAdapter } from "./BaseAdapter.js";
import type {
  CallbackFunction,
  Decorator,
  ImportDeclaration,
  NamedImports,
  NamespaceImport,
  Node,
  ObjectLiteralExpression,
  ParenthesizedExpression,
  PropertyAssignment,
  SpreadAssignment,
  StringLiteral,
  StringLiteralLikeNode,
} from "./types.js";

export class CompatTypeScript extends BaseAdapter {
  // TODO make this private after implementing all needed methods
  compiler: typeof ts6;
  version: string;

  LanguageVariant: typeof ts6.LanguageVariant;
  SyntaxKind: typeof ts6.SyntaxKind;
  TypeFlags: typeof ts6.TypeFlags;

  constructor(compiler: typeof ts6, version: string) {
    super();

    this.compiler = compiler;
    this.version = version;

    this.LanguageVariant = compiler.LanguageVariant;
    this.SyntaxKind = compiler.SyntaxKind;
    this.TypeFlags = compiler.TypeFlags;
  }

  async close() {
    // await this.#cleanup();
  }

  getLeadingCommentRanges(text: string, pos: number) {
    return this.compiler.getLeadingCommentRanges(text, pos);
  }

  isCallbackFunction(node: Node): node is CallbackFunction {
    return this.compiler.isArrowFunction(node as ts6.Node) || this.compiler.isFunctionExpression(node as ts6.Node);
  }

  isDecorator(node: Node): node is Decorator {
    return this.compiler.isDecorator(node as ts6.Node);
  }

  isImportDeclaration(node: Node): node is ImportDeclaration {
    return this.compiler.isImportDeclaration(node as ts6.Node);
  }

  isNamespaceImport(node: Node): node is NamespaceImport {
    return this.compiler.isNamespaceImport(node as ts6.Node);
  }

  isNamedImports(node: Node): node is NamedImports {
    return this.compiler.isNamedImports(node as ts6.Node);
  }

  isObjectLiteralExpression(node: Node): node is ObjectLiteralExpression {
    return this.compiler.isObjectLiteralExpression(node as ts6.Node);
  }

  isParenthesizedExpression(node: Node): node is ParenthesizedExpression {
    return this.compiler.isParenthesizedExpression(node as ts6.Node);
  }

  isPropertyAssignment(node: Node): node is PropertyAssignment {
    return this.compiler.isPropertyAssignment(node as ts6.Node);
  }

  isSpreadAssignment(node: Node): node is SpreadAssignment {
    return this.compiler.isSpreadAssignment(node as ts6.Node);
  }

  isStringLiteral(node: Node): node is StringLiteral {
    return this.compiler.isStringLiteral(node as ts6.Node);
  }

  isStringLiteralLikeNode(node: Node): node is StringLiteralLikeNode {
    return this.compiler.isStringLiteralLike(node as ts6.Node);
  }

  isTypeOnlyImportDeclaration(node: ImportDeclaration): boolean {
    return (node as ts6.ImportDeclaration).importClause?.isTypeOnly === true;
  }

  unescapeLeadingUnderscores(identifier: ts6.__String): string {
    return this.compiler.unescapeLeadingUnderscores(identifier);
  }
}
