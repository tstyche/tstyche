import type ts6 from "@typescript/typescript6";
import type * as tsAst from "typescript/unstable/ast";
import type * as tsApi from "typescript/unstable/sync";
import type { CompatTypeScript } from "./CompatTypeScript.js";
import type { NativeTypeScript } from "./NativeTypeScript.js";

export type CallExpression = tsAst.CallExpression | ts6.CallExpression;
export type CallbackFunction =
  | (tsAst.ArrowFunction | tsAst.FunctionExpression)
  | (ts6.ArrowFunction | ts6.FunctionExpression);
export type CommentRange = tsAst.CommentRange | ts6.CommentRange;
export type Decorator = tsAst.Decorator | ts6.Decorator;
export type Diagnostic = tsApi.Diagnostic | ts6.Diagnostic;
export type DiagnosticLocation = ts6.DiagnosticWithLocation;
export type DiagnosticPosition = tsApi.Diagnostic & { fileName: string };
export type Expression = tsAst.Expression | ts6.Expression;
export type ExpressionStatement = tsAst.ExpressionStatement | ts6.ExpressionStatement;
export type ExpressionWithTypeArguments = tsAst.ExpressionWithTypeArguments | ts6.ExpressionWithTypeArguments;
export type Identifier = tsAst.Identifier | ts6.Identifier;
export type ImportDeclaration = tsAst.ImportDeclaration | ts6.ImportDeclaration;
export type LiteralType = tsApi.LiteralType | ts6.LiteralType;
export type NamespaceImport = tsAst.NamespaceImport | ts6.NamespaceImport;
export type NamedImports = tsAst.NamedImports | ts6.NamedImports;
export type Node = tsAst.Node | ts6.Node;
export type NodeArray<T extends Node> = T extends tsAst.Node
  ? tsAst.NodeArray<T>
  : T extends ts6.Node
    ? ts6.NodeArray<T>
    : never;
export type NumericLiteral = tsAst.NumericLiteral | ts6.NumericLiteral;
export type NumberLiteralType = tsApi.NumberLiteralType | ts6.NumberLiteralType;
export type ObjectLiteralExpression = tsAst.ObjectLiteralExpression | ts6.ObjectLiteralExpression;
export type ParenthesizedExpression = tsAst.ParenthesizedExpression | ts6.ParenthesizedExpression;
export type PropertyAccessExpression = tsAst.PropertyAccessExpression | ts6.PropertyAccessExpression;
export type PropertyDeclaration = tsAst.PropertyDeclaration | ts6.PropertyDeclaration;
export type PropertyAssignment = tsAst.PropertyAssignment | ts6.PropertyAssignment;
export type RegularExpressionLiteral = tsAst.RegularExpressionLiteral | ts6.RegularExpressionLiteral;
export type SourceFile = tsAst.SourceFile | ts6.SourceFile;
export type SpreadAssignment = tsAst.SpreadAssignment | ts6.SpreadAssignment;
export type StringLiteral = tsAst.StringLiteral | ts6.StringLiteral;
export type StringLiteralLikeNode = tsAst.StringLiteralLikeNode | ts6.StringLiteralLike;
export type StringLiteralType = tsApi.StringLiteralType | ts6.StringLiteralType;
export type TupleTypeNode = tsAst.TupleTypeNode | ts6.TupleTypeNode;
export type Type = tsApi.Type | ts6.Type;
export type TypeNode = tsAst.TypeNode | ts6.TypeNode;
export type TypeReferenceNode = tsAst.TypeReferenceNode | ts6.TypeReferenceNode;

export type TypeScript = NativeTypeScript | CompatTypeScript;
