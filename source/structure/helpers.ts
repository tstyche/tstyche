import type ts from "typescript";

export function containsInstantiable(target: ts.Type, compiler: typeof ts): boolean {
  return (
    "types" in target &&
    (target as ts.Type & { types: Array<ts.Type> }).types.some((type) => type.flags & compiler.TypeFlags.Instantiable)
  );
}

export function getIndexSignatures(
  type: ts.Type,
  compiler: typeof ts,
  typeChecker: ts.TypeChecker,
): ReadonlyArray<ts.IndexInfo> {
  if (type.flags & compiler.TypeFlags.Intersection) {
    return (type as ts.IntersectionType).types.flatMap((type) => getIndexSignatures(type, compiler, typeChecker));
  }

  return typeChecker.getIndexInfosOfType(type);
}

export function getSignatures(
  type: ts.Type,
  kind: ts.SignatureKind,
  compiler: typeof ts,
  typeChecker: ts.TypeChecker,
): ReadonlyArray<ts.Signature> {
  if (type.flags & compiler.TypeFlags.Intersection) {
    return (type as ts.IntersectionType).types.flatMap((type) => getSignatures(type, kind, compiler, typeChecker));
  }

  return typeChecker.getSignaturesOfType(type, kind);
}

export function getThisTypeOfSignature(signature: ts.Signature, typeChecker: ts.TypeChecker): ts.Type | undefined {
  return signature.thisParameter && typeChecker.getTypeOfSymbol(signature.thisParameter);
}

export function getTypeParametersOfSignature(signature: ts.Signature): ReadonlyArray<ts.TypeParameter> {
  return signature.typeParameters ?? [];
}

export function getTypeParameterModifiers(typeParameter: ts.TypeParameter, compiler: typeof ts): ts.ModifierFlags {
  if (!typeParameter.symbol.declarations) {
    return compiler.ModifierFlags.None;
  }

  return (
    typeParameter.symbol.declarations.reduce(
      (modifiers, declaration) => modifiers | compiler.getEffectiveModifierFlags(declaration),
      compiler.ModifierFlags.None,
    ) &
    (compiler.ModifierFlags.In | compiler.ModifierFlags.Out | compiler.ModifierFlags.Const)
  );
}

export function getTargetSymbol(symbol: ts.Symbol, compiler: typeof ts): ts.Symbol | undefined {
  return isCheckFlagSet(symbol, compiler.CheckFlags.Instantiated, compiler)
    ? (symbol as ts.TransientSymbol).links.target
    : symbol;
}

export function isCheckFlagSet(symbol: ts.Symbol, flag: ts.CheckFlags, compiler: typeof ts): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Transient && (symbol as ts.TransientSymbol).links.checkFlags & flag);
}

export function isSymbolFromDefaultLibrary(symbol: ts.Symbol, program: ts.Program): boolean {
  return !!symbol.declarations?.every((declaration) => program.isSourceFileDefaultLibrary(declaration.getSourceFile()));
}
