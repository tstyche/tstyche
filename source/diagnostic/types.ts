import type { Diagnostic } from "./Diagnostic.js";

export type DiagnosticsHandler = (diagnostics: Diagnostic | Array<Diagnostic>) => void;
