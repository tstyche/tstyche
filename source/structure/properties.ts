import type ts6 from "@typescript/typescript6";
import type * as ts from "#typescript";
import { isCheckFlagSet } from "./helpers.js";

export function getPropertyType(
  symbol: ts6.Symbol,
  compiler: typeof ts6,
  compilerOptions: ts.CompilerOptions,
  typeChecker: ts6.TypeChecker,
): ts6.Type {
  const type = typeChecker.getTypeOfSymbol(symbol);

  if (compilerOptions.exactOptionalPropertyTypes && isOptionalProperty(symbol, compiler)) {
    if (type.flags & compiler.TypeFlags.Union) {
      const filteredType = (type as ts6.UnionType).types.filter(
        (type) => !("debugIntrinsicName" in type && type.debugIntrinsicName === "missing"),
      );

      if (filteredType.length === (type as ts6.UnionType).types.length) {
        return type;
      }

      if (filteredType.length === 1) {
        return filteredType.at(0)!;
      }

      return { ...type, types: filteredType } as ts6.UnionType;
    }
  }

  return type;
}

export function isOptionalProperty(symbol: ts6.Symbol, compiler: typeof ts6): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Optional);
}

// Utilizing internal 'CheckFlags' here because there is currently no other way to determine
// if a property is readonly in a mapped type
// https://github.com/microsoft/TypeScript/issues/31296
export function isReadonlyProperty(symbol: ts6.Symbol, compiler: typeof ts6): boolean {
  return !!(
    isCheckFlagSet(symbol, compiler.CheckFlags.Readonly, compiler) ||
    (symbol.flags & compiler.SymbolFlags.Property &&
      compiler.getDeclarationModifierFlagsFromSymbol(symbol) & compiler.ModifierFlags.Readonly) ||
    (symbol.flags & compiler.SymbolFlags.Accessor && !(symbol.flags & compiler.SymbolFlags.SetAccessor))
  );
}
