import type ts from "typescript";

export function isFreshLiteralType(type: ts.Type, compiler: typeof ts): type is ts.FreshableType {
  return !!(type.flags & compiler.TypeFlags.Freshable) && (type as ts.LiteralType).freshType === type;
}

export function isIntersection(type: ts.Type, compiler: typeof ts): type is ts.IntersectionType {
  return !!(type.flags & compiler.TypeFlags.Intersection);
}

export function isObjectType(type: ts.Type, compiler: typeof ts): type is ts.ObjectType {
  return !!(type.flags & compiler.TypeFlags.Object);
}

export function isOptionalProperty(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Optional);
}

export function isReadonlyProperty(symbol: ts.Symbol, compiler: typeof ts) {
  return symbol.declarations?.every(
    (declaration) =>
      compiler.isPropertySignature(declaration) &&
      declaration.modifiers?.some((modifier) => modifier.kind === compiler.SyntaxKind.ReadonlyKeyword),
  );
}

export function isUnion(type: ts.Type, compiler: typeof ts): type is ts.UnionType {
  return !!(type.flags & compiler.TypeFlags.Union);
}

export function isTypeReference(type: ts.ObjectType, compiler: typeof ts): type is ts.TypeReference {
  return !!(type.objectFlags & compiler.ObjectFlags.Reference);
}
