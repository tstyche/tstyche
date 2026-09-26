import type { Diagnostic } from "./Diagnostic.js";

export type DiagnosticsHandler<T extends Diagnostic | Array<Diagnostic> = Diagnostic> = (
  this: void,
  diagnostics: T,
) => void;
