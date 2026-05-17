import type ts from "typescript";

export function isUnionType(compiler: typeof ts, type: ts.Type): type is ts.UnionType {
  return !!(type.flags & compiler.TypeFlags.Union);
}
