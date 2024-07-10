import type { Diagnostic } from "#diagnostic";

export type DiagnosticsHandler = (diagnostics: Diagnostic | Array<Diagnostic>) => void;
