import type ts from "typescript";

export function getTargetSymbol(symbol: ts.Symbol, compiler: typeof ts) {
  return isCheckFlagSet(symbol, compiler.CheckFlags.Instantiated, compiler)
    ? (symbol as ts.TransientSymbol).links.target
    : symbol;
}

export function isCheckFlagSet(symbol: ts.Symbol, flag: ts.CheckFlags, compiler: typeof ts): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Transient && (symbol as ts.TransientSymbol).links.checkFlags & flag);
}

export function isSymbolFromDefaultLibrary(symbol: ts.Symbol, program: ts.Program): boolean {
  if (!symbol.declarations) {
    return false;
  }

  return symbol.declarations.every((declaration) => program.isSourceFileDefaultLibrary(declaration.getSourceFile()));
}
