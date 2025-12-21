import type ts from "typescript";

export function ensureArray<T>(input: ReadonlyArray<T> | undefined): ReadonlyArray<T> {
  return input ?? [];
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

export function getTargetSymbol(symbol: ts.Symbol, compiler: typeof ts) {
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

export function length(array: ReadonlyArray<unknown> | undefined): number {
  return array?.length ?? 0;
}
