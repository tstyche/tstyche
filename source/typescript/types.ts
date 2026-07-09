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
export type CompilerOptions = tsApi.CompilerOptions | ts6.CompilerOptions;
export type ConditionalType = tsApi.ConditionalType | ts6.ConditionalType;
export type Decorator = tsAst.Decorator | ts6.Decorator;
export type Diagnostic = tsApi.Diagnostic | ts6.Diagnostic;
export type DiagnosticLocation = ts6.DiagnosticWithLocation;
export type DiagnosticPosition = tsApi.Diagnostic & { fileName: string };
export type Expression = tsAst.Expression | ts6.Expression;
export type ExpressionStatement = tsAst.ExpressionStatement | ts6.ExpressionStatement;
export type ExpressionWithTypeArguments = tsAst.ExpressionWithTypeArguments | ts6.ExpressionWithTypeArguments;
export type FreshableType = tsApi.FreshableType | ts6.FreshableType;
export type Identifier = tsAst.Identifier | ts6.Identifier;
export type ImportDeclaration = tsAst.ImportDeclaration | ts6.ImportDeclaration;
export type IndexedAccessType = tsApi.IndexedAccessType | ts6.IndexedAccessType;
export type IndexInfo = tsApi.IndexInfo | ts6.IndexInfo;
export type IndexType = tsApi.IndexType | ts6.IndexType;
export type IntersectionType = tsApi.IntersectionType | ts6.IntersectionType;
export type LiteralType = tsApi.LiteralType | ts6.LiteralType;
export type ModifierFlags = tsApi.ModifierFlags | ts6.ModifierFlags;
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
export type ObjectType = tsApi.ObjectType | ts6.ObjectType;
export type ObjectLiteralExpression = tsAst.ObjectLiteralExpression | ts6.ObjectLiteralExpression;
export type ParameterDeclaration = tsAst.ParameterDeclaration | ts6.ParameterDeclaration;
export type ParenthesizedExpression = tsAst.ParenthesizedExpression | ts6.ParenthesizedExpression;
export type Program = tsApi.Program | ts6.Program;
export type PropertyAccessExpression = tsAst.PropertyAccessExpression | ts6.PropertyAccessExpression;
export type PropertyDeclaration = tsAst.PropertyDeclaration | ts6.PropertyDeclaration;
export type PropertyAssignment = tsAst.PropertyAssignment | ts6.PropertyAssignment;
export type RegularExpressionLiteral = tsAst.RegularExpressionLiteral | ts6.RegularExpressionLiteral;
export type Signature = tsApi.Signature | ts6.Signature;
export type SignatureKind = tsApi.SignatureKind | ts6.SignatureKind;
export type SourceFile = tsAst.SourceFile | ts6.SourceFile;
export type SpreadAssignment = tsAst.SpreadAssignment | ts6.SpreadAssignment;
export type StringLiteral = tsAst.StringLiteral | ts6.StringLiteral;
export type StringLiteralLikeNode = tsAst.StringLiteralLikeNode | ts6.StringLiteralLike;
export type StringLiteralType = tsApi.StringLiteralType | ts6.StringLiteralType;
export type StringMappingType = tsApi.StringMappingType | ts6.StringMappingType;
export type StructuredType = TStructuredType | ts6.StructuredType;
export type SubstitutionType = tsApi.SubstitutionType | ts6.SubstitutionType;
export type Symbol = tsApi.Symbol | ts6.Symbol;
export type TemplateLiteralType = tsApi.TemplateLiteralType | ts6.TemplateLiteralType;
export type TupleType = tsApi.TupleType | ts6.TupleType;
export type TupleTypeNode = tsAst.TupleTypeNode | ts6.TupleTypeNode;
export type TupleTypeReference = TTupleTypeReference | ts6.TupleTypeReference;
export type Type = tsApi.Type | ts6.Type;
export type TypeNode = tsAst.TypeNode | ts6.TypeNode;
export type TypeParameter = tsApi.TypeParameter | ts6.TypeParameter;
export type TypePredicate = tsApi.TypePredicate | ts6.TypePredicate;
export type TypeReference = tsApi.TypeReference | ts6.TypeReference;
export type TypeReferenceNode = tsAst.TypeReferenceNode | ts6.TypeReferenceNode;
export type UnionType = tsApi.UnionType | ts6.UnionType;

export type TypeScript = NativeTypeScript | CompatTypeScript;

// TODO waiting for: https://github.com/microsoft/typescript-go/issues/4539
type TStructuredType = tsApi.ObjectType | tsApi.UnionType | tsApi.IntersectionType;

// TODO waiting for: https://github.com/microsoft/typescript-go/issues/4499
interface TTupleTypeReference extends tsApi.TypeReference {
  getTarget(): tsApi.TupleType;
}
