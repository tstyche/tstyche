import type ts from "typescript";

export function getDeclarationModifierFlagsFromSymbol(symbol: ts.Symbol, compiler: typeof ts): ts.ModifierFlags {
  if (symbol.valueDeclaration) {
    const declaration =
      (symbol.flags & compiler.SymbolFlags.GetAccessor &&
        symbol.declarations?.find(compiler.isGetAccessorDeclaration)) ||
      symbol.valueDeclaration;

    const flags = compiler.getCombinedModifierFlags(declaration);

    return symbol.parent && symbol.parent.flags & compiler.SymbolFlags.Class
      ? flags
      : flags & ~compiler.ModifierFlags.AccessibilityModifier;
  }

  if (isCheckFlagSet(symbol, compiler.CheckFlags.Synthetic, compiler)) {
    const checkFlags = (symbol as ts.TransientSymbol).links.checkFlags;

    const accessModifier =
      checkFlags & compiler.CheckFlags.ContainsPrivate
        ? compiler.ModifierFlags.Private
        : checkFlags & compiler.CheckFlags.ContainsPublic
          ? compiler.ModifierFlags.Public
          : compiler.ModifierFlags.Protected;

    const staticModifier =
      checkFlags & compiler.CheckFlags.ContainsStatic ? compiler.ModifierFlags.Static : compiler.ModifierFlags.None;

    return accessModifier | staticModifier;
  }

  if (symbol.flags & compiler.SymbolFlags.Prototype) {
    return compiler.ModifierFlags.Public | compiler.ModifierFlags.Static;
  }

  return compiler.ModifierFlags.None;
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
  if (!symbol.declarations) {
    return false;
  }

  return symbol.declarations.every((declaration) => program.isSourceFileDefaultLibrary(declaration.getSourceFile()));
}
