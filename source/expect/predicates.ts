import type ts from "typescript";

export function isStringOrNumberLiteralType(
  compiler: typeof ts,
  type: ts.Type,
): type is ts.StringLiteralType | ts.NumberLiteralType {
  return !!(type.flags & compiler.TypeFlags.StringOrNumberLiteral);
}

export function isUnionType(compiler: typeof ts, type: ts.Type): type is ts.UnionType {
  return !!(type.flags & compiler.TypeFlags.Union);
}

export function isUniqueSymbolType(compiler: typeof ts, type: ts.Type): type is ts.UniqueESSymbolType {
  return !!(type.flags & compiler.TypeFlags.UniqueESSymbol);
}
