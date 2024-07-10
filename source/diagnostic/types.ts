import type { Diagnostic } from "./Diagnostic.js";

export type DiagnosticsHandler = (diagnostic: Array<Diagnostic>) => void;
