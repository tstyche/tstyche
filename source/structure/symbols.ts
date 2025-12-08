import type ts from "typescript";

function isModifierFlagSet(node: ts.Declaration | undefined, flag: ts.ModifierFlags, compiler: typeof ts): boolean {
  return node != null && !!(compiler.getCombinedModifierFlags(node) & flag);
}

function isCheckFlagSet(symbol: ts.Symbol, flag: ts.CheckFlags, compiler: typeof ts): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Transient && (symbol as ts.TransientSymbol).links.checkFlags & flag);
}

export function isOptionalSymbol(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return !!(symbol.flags & compiler.SymbolFlags.Optional);
}

export function isPrivateSymbol(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return (
    isModifierFlagSet(symbol.valueDeclaration, compiler.ModifierFlags.Private, compiler) ||
    (symbol?.valueDeclaration != null &&
      compiler.isPropertyDeclaration(symbol.valueDeclaration) &&
      compiler.isPrivateIdentifier(symbol.valueDeclaration.name))
  );
}

// Utilizing internal 'CheckFlags' here because there is currently no other way to determine
// if a property is readonly in a mapped type
// https://github.com/microsoft/TypeScript/issues/31296
export function isReadonlySymbol(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return !!(
    isCheckFlagSet(symbol, compiler.CheckFlags.Readonly, compiler) ||
    (symbol.flags & compiler.SymbolFlags.Property &&
      isModifierFlagSet(symbol.valueDeclaration, compiler.ModifierFlags.Readonly, compiler)) ||
    (symbol.flags & compiler.SymbolFlags.Accessor && !(symbol.flags & compiler.SymbolFlags.SetAccessor))
  );
}

// export function getDeclarationModifierFlagsFromSymbol(s: ts.Symbol, compiler: typeof ts): ts.ModifierFlags {
//   if (s.valueDeclaration) {
//     const flags = compiler.getCombinedModifierFlags(s.valueDeclaration);

//     return s.parent && s.parent.flags & SymbolFlags.Class ? flags : flags & ~ModifierFlags.AccessibilityModifier;
//   }
//   if (getCheckFlags(s) & CheckFlags.Synthetic) {
//     const checkFlags = (<ts.TransientSymbol>s).checkFlags;
//     const accessModifier =
//       checkFlags & CheckFlags.ContainsPrivate
//         ? ModifierFlags.Private
//         : checkFlags & CheckFlags.ContainsPublic
//           ? ModifierFlags.Public
//           : ModifierFlags.Protected;
//     const staticModifier = checkFlags & CheckFlags.ContainsStatic ? ModifierFlags.Static : 0;

//     return accessModifier | staticModifier;
//   }

//   if (s.flags & SymbolFlags.Prototype) {
//     return ModifierFlags.Public | ModifierFlags.Static;
//   }

//   return 0;
// }
