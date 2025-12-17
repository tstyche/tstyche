import type ts from "typescript";
import { isUnionType } from "./predicates.js";
import { isCheckFlagSet } from "./symbols.js";

export function getPropertyType(
  symbol: ts.Symbol,
  compiler: typeof ts,
  compilerOptions: ts.CompilerOptions,
  typeChecker: ts.TypeChecker,
): ts.Type {
  const type = typeChecker.getTypeOfSymbol(symbol);

  if (compilerOptions.exactOptionalPropertyTypes && isOptionalProperty(symbol, compiler)) {
    if (isUnionType(type, compiler)) {
      type.types = type.types.filter(
        (type) => !("debugIntrinsicName" in type && type.debugIntrinsicName === "missing"),
      );

      if (type.types.length === 1) {
        return type.types.at(0) as ts.Type;
      }
    }
  }

  return type;
}

export function isOptionalProperty(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Optional);
}

// Utilizing internal 'CheckFlags' here because there is currently no other way to determine
// if a property is readonly in a mapped type
// https://github.com/microsoft/TypeScript/issues/31296
export function isReadonlyProperty(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return !!(
    isCheckFlagSet(symbol, compiler.CheckFlags.Readonly, compiler) ||
    (symbol.flags & compiler.SymbolFlags.Property &&
      compiler.getDeclarationModifierFlagsFromSymbol(symbol) & compiler.ModifierFlags.Readonly) ||
    (symbol.flags & compiler.SymbolFlags.Accessor && !(symbol.flags & compiler.SymbolFlags.SetAccessor))
  );
}
