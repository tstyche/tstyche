import type * as ast from "@typescript/native-preview/unstable/ast";
import type ts6 from "typescript";
import type { CompatTypeScript } from "./CompatTypeScript.js";
import type { NativeTypeScript } from "./NativeTypeScript.js";

export type CallExpression = ast.CallExpression | ts6.CallExpression;
export type CallbackFunction =
  | (ast.ArrowFunction | ast.FunctionExpression)
  | (ts6.ArrowFunction | ts6.FunctionExpression);
export type CommentRange = ast.CommentRange | ts6.CommentRange;
export type Decorator = ast.Decorator | ts6.Decorator;
export type Expression = ast.Expression | ts6.Expression;
export type ExpressionStatement = ast.ExpressionStatement | ts6.ExpressionStatement;
export type ExpressionWithTypeArguments = ast.ExpressionWithTypeArguments | ts6.ExpressionWithTypeArguments;
export type Identifier = ast.Identifier | ts6.Identifier;
export type ImportDeclaration = ast.ImportDeclaration | ts6.ImportDeclaration;
export type NamespaceImport = ast.NamespaceImport | ts6.NamespaceImport;
export type NamedImports = ast.NamedImports | ts6.NamedImports;
export type Node = ast.Node | ts6.Node;

export type NodeArray<T extends Node> = T extends ast.Node
  ? ast.NodeArray<T>
  : T extends ts6.Node
    ? ts6.NodeArray<T>
    : never;

export type NumericLiteral = ast.NumericLiteral | ts6.NumericLiteral;
export type ObjectLiteralExpression = ast.ObjectLiteralExpression | ts6.ObjectLiteralExpression;
export type ParenthesizedExpression = ast.ParenthesizedExpression | ts6.ParenthesizedExpression;
export type PropertyAccessExpression = ast.PropertyAccessExpression | ts6.PropertyAccessExpression;
export type PropertyAssignment = ast.PropertyAssignment | ts6.PropertyAssignment;
export type RegularExpressionLiteral = ast.RegularExpressionLiteral | ts6.RegularExpressionLiteral;
export type SourceFile = ast.SourceFile | ts6.SourceFile;
export type SpreadAssignment = ast.SpreadAssignment | ts6.SpreadAssignment;
export type StringLiteral = ast.StringLiteral | ts6.StringLiteral;
export type StringLiteralLikeNode = ast.StringLiteralLikeNode | ts6.StringLiteralLike;
export type TupleTypeNode = ast.TupleTypeNode | ts6.TupleTypeNode;
export type TypeNode = ast.TypeNode | ts6.TypeNode;
export type TypeReferenceNode = ast.TypeReferenceNode | ts6.TypeReferenceNode;

export type TypeScript = NativeTypeScript | CompatTypeScript;
