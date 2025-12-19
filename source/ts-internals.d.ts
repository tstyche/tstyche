import "typescript";

declare module "typescript" {
  /** @internal */
  enum CheckFlags {
    None = 0,
    Instantiated = 1 << 0, // Instantiated symbol
    Readonly = 1 << 3, // Readonly transient symbol
  }

  /** @internal */
  interface SymbolLinks {
    target?: Symbol; // Original version of an instantiated symbol
  }

  /** @internal */
  interface TransientSymbol extends Symbol {
    links: TransientSymbolLinks;
  }

  /** @internal */
  interface TransientSymbolLinks extends SymbolLinks {
    checkFlags: number;
  }

  interface Type {
    /** @internal */ id: unknown;
  }

  function getDeclarationModifierFlagsFromSymbol(symbol: Symbol): ModifierFlags;

  function getEffectiveModifierFlags(node: Node): ModifierFlags;
}
