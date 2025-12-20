import type ts from "typescript";

export function isClass(type: ts.ObjectType, compiler: typeof ts): type is ts.InterfaceType {
  return !!(type.objectFlags & compiler.ObjectFlags.Class);
}

export function isFreshLiteralType(type: ts.Type, compiler: typeof ts): type is ts.FreshableType {
  return !!(type.flags & compiler.TypeFlags.Freshable) && (type as ts.LiteralType).freshType === type;
}

export function isIntersectionType(type: ts.Type, compiler: typeof ts): type is ts.IntersectionType {
  return !!(type.flags & compiler.TypeFlags.Intersection);
}

export function isNoInferType(type: ts.Type, compiler: typeof ts): type is ts.SubstitutionType {
  // A 'NoInfer<T>' type is represented as a substitution type with a 'TypeFlags.Unknown' constraint.
  return !!(
    type.flags & compiler.TypeFlags.Substitution &&
    (type as ts.SubstitutionType).constraint.flags & compiler.TypeFlags.Unknown
  );
}

export function isObjectType(type: ts.Type, compiler: typeof ts): type is ts.ObjectType {
  return !!(type.flags & compiler.TypeFlags.Object);
}

export function isUnionType(type: ts.Type, compiler: typeof ts): type is ts.UnionType {
  return !!(type.flags & compiler.TypeFlags.Union);
}

export function isTupleType(type: ts.ObjectType, compiler: typeof ts): type is ts.TupleType {
  return !!(type.objectFlags & compiler.ObjectFlags.Tuple);
}

export function isTupleTypeReference(type: ts.Type, compiler: typeof ts): type is ts.TupleTypeReference {
  return isObjectType(type, compiler) && isTypeReference(type, compiler) && isTupleType(type.target, compiler);
}

export function isTypeReference(type: ts.ObjectType, compiler: typeof ts): type is ts.TypeReference {
  return !!(type.objectFlags & compiler.ObjectFlags.Reference);
}
