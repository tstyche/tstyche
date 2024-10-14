import type { Diagnostic } from "./Diagnostic.js";

export type DiagnosticsHandler = (this: void, diagnostic: Diagnostic) => void;
