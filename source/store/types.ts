import type { Diagnostic } from "#diagnostic";

export type DiagnosticsHandler = (diagnostic: Diagnostic) => void;

export interface Manifest {
  $version: string;
  lastUpdated: number;
  npmRegistry: string;
  resolutions: Record<string, string>;
  sources: Record<string, { integrity: string; tarball: string }>;
  versions: Array<string>;
}
