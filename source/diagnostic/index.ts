export { Diagnostic } from "./Diagnostic.js";
export { DiagnosticCategory } from "./DiagnosticCategory.enum.js";
export { DiagnosticOrigin } from "./DiagnosticOrigin.js";
export {
  compareDiagnostics,
  diagnosticBelongsToNode,
  getDiagnosticMessageText,
  isDiagnosticLocation,
  isDiagnosticPosition,
} from "./helpers.js";
export type { DiagnosticsHandler } from "./types.js";
