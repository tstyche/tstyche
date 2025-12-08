import "typescript";

declare module "typescript" {
  /** @internal */
  enum CheckFlags {
    None = 0,
    Readonly = 1 << 3,
  }

  /** @internal */
  interface SymbolLinks {
    type?: Type;
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
