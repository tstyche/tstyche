import type {
  CallExpression,
  Decorator,
  ExpressionStatement,
  ExpressionWithTypeArguments,
  Identifier,
  ImportDeclaration,
  NamedImports,
  NamespaceImport,
  Node,
  NumericLiteral,
  ObjectLiteralExpression,
  ParenthesizedExpression,
  PropertyAccessExpression,
  PropertyAssignment,
  RegularExpressionLiteral,
  SourceFile,
  SpreadAssignment,
  StringLiteral,
  StringLiteralLikeNode,
  TupleTypeNode,
  TypeReferenceNode,
} from "./types.js";

export abstract class BaseAdapter {
  abstract LanguageVariant: any;
  abstract SyntaxKind: any;
  abstract TypeFlags: any;

  // ast

  isCallExpression(node: Node): node is CallExpression {
    return node.kind === this.SyntaxKind.CallExpression;
  }

  isDecorator(node: Node): node is Decorator {
    return node.kind === this.SyntaxKind.Decorator;
  }

  isExpressionStatement(node: Node): node is ExpressionStatement {
    return node.kind === this.SyntaxKind.ExpressionStatement;
  }

  isExpressionWithTypeArguments(node: Node): node is ExpressionWithTypeArguments {
    return node.kind === this.SyntaxKind.ExpressionWithTypeArguments;
  }

  isIdentifier(node: Node): node is Identifier {
    return node.kind === this.SyntaxKind.Identifier;
  }

  isImportDeclaration(node: Node): node is ImportDeclaration {
    return node.kind === this.SyntaxKind.ImportDeclaration;
  }

  isNamedImports(node: Node): node is NamedImports {
    return node.kind === this.SyntaxKind.NamedImports;
  }

  isNamespaceImport(node: Node): node is NamespaceImport {
    return node.kind === this.SyntaxKind.NamespaceImport;
  }

  isNumericLiteral(node: Node): node is NumericLiteral {
    return node.kind === this.SyntaxKind.NumericLiteral;
  }

  isObjectLiteralExpression(node: Node): node is ObjectLiteralExpression {
    return node.kind === this.SyntaxKind.ObjectLiteralExpression;
  }

  isParenthesizedExpression(node: Node): node is ParenthesizedExpression {
    return node.kind === this.SyntaxKind.ParenthesizedExpression;
  }

  isPropertyAccessExpression(node: Node): node is PropertyAccessExpression {
    return node.kind === this.SyntaxKind.PropertyAccessExpression;
  }

  isPropertyAssignment(node: Node): node is PropertyAssignment {
    return node.kind === this.SyntaxKind.PropertyAssignment;
  }

  isRegularExpressionLiteral(node: Node): node is RegularExpressionLiteral {
    return node.kind === this.SyntaxKind.RegularExpressionLiteral;
  }

  isSourceFile(node: Node): node is SourceFile {
    return node.kind === this.SyntaxKind.SourceFile;
  }

  isSpreadAssignment(node: Node): node is SpreadAssignment {
    return node.kind === this.SyntaxKind.SpreadAssignment;
  }

  isStringLiteral(node: Node): node is StringLiteral {
    return node.kind === this.SyntaxKind.StringLiteral;
  }

  isStringLiteralLikeNode(node: Node): node is StringLiteralLikeNode {
    return node.kind === this.SyntaxKind.StringLiteral || node.kind === this.SyntaxKind.NoSubstitutionTemplateLiteral;
  }

  isTupleTypeNode(node: Node): node is TupleTypeNode {
    return node.kind === this.SyntaxKind.TupleType;
  }

  isTypeReferenceNode(node: Node): node is TypeReferenceNode {
    return node.kind === this.SyntaxKind.TypeReference;
  }

  // ast utils

  belongsToArgumentList(node: Node): boolean {
    return this.isCallExpression(node.parent) && node.parent.arguments.some((argument) => argument === node);
  }

  isCapitaizedIdentifierLike(node: Node): boolean {
    return this.isIdentifierLike(node) && /^[A-Z_$]/.test(node.getText());
  }

  isChildOfExpressionStatement(node: Node): boolean {
    return this.isExpressionStatement(node.parent);
  }

  isIdentifierLike(node: Node): boolean {
    return (
      this.isIdentifier(node) ||
      this.isPropertyAccessExpression(node) ||
      this.isTypeReferenceNode(node) ||
      this.isExpressionWithTypeArguments(node)
    );
  }
}
