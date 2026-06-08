import type {
  CallExpression,
  ExpressionStatement,
  ExpressionWithTypeArguments,
  Identifier,
  Node,
  NumericLiteral,
  PropertyAccessExpression,
  RegularExpressionLiteral,
  SourceFile,
  TupleTypeNode,
  TypeReferenceNode,
} from "./types.js";

export abstract class BaseAdapter {
  abstract LanguageVariant: any;
  abstract SyntaxKind: any;
  abstract TypeFlags: any;

  belongsToArgumentList(node: Node): boolean {
    return this.isCallExpression(node.parent) && node.parent.arguments.some((argument) => argument === node);
  }

  isCallExpression(node: Node): node is CallExpression {
    return node.kind === this.SyntaxKind.CallExpression;
  }

  isCapitaizedIdentifierLike(node: Node): boolean {
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    return this.isIdentifierLike(node) && /^[A-Z_$]/.test(node.getText());
  }

  isChildOfExpressionStatement(node: Node): boolean {
    return this.isExpressionStatement(node.parent);
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

  isIdentifierLike(node: Node): boolean {
    return (
      this.isIdentifier(node) ||
      this.isPropertyAccessExpression(node) ||
      this.isTypeReferenceNode(node) ||
      this.isExpressionWithTypeArguments(node)
    );
  }

  isNumericLiteral(node: Node): node is NumericLiteral {
    return node.kind === this.SyntaxKind.NumericLiteral;
  }

  isPropertyAccessExpression(node: Node): node is PropertyAccessExpression {
    return node.kind === this.SyntaxKind.PropertyAccessExpression;
  }

  isRegularExpressionLiteral(node: Node): node is RegularExpressionLiteral {
    return node.kind === this.SyntaxKind.RegularExpressionLiteral;
  }

  isTypeReferenceNode(node: Node): node is TypeReferenceNode {
    return node.kind === this.SyntaxKind.TypeReference;
  }

  isSourceFile(node: Node): node is SourceFile {
    return node.kind === this.SyntaxKind.SourceFile;
  }

  isTupleTypeNode(node: Node): node is TupleTypeNode {
    return node.kind === this.SyntaxKind.TupleType;
  }
}
