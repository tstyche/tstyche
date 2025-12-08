import "typescript";

declare module "typescript" {
  /** @internal */
  enum CheckFlags {
    None = 0,
    Instantiated = 1 << 0, // Instantiated symbol
    SyntheticProperty = 1 << 1, // Property in union or intersection type
    SyntheticMethod = 1 << 2, // Method in union or intersection type
    Readonly = 1 << 3, // Readonly transient symbol

    ContainsPublic = 1 << 8, // Synthetic property with public constituent(s)
    ContainsProtected = 1 << 9, // Synthetic property with protected constituent(s)
    ContainsPrivate = 1 << 10, // Synthetic property with private constituent(s)
    ContainsStatic = 1 << 11, // Synthetic property with static constituent(s)

    Synthetic = SyntheticProperty | SyntheticMethod,
  }

  interface Symbol {
    /** @internal */ parent?: Symbol;
  }

  /** @internal */
  interface SymbolLinks {
    target?: Symbol; // Original version of an instantiated symbol
    type?: Type; // Type of value symbol
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
}
