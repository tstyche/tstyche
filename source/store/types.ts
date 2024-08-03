import type { Diagnostic } from "#diagnostic";

export type DiagnosticsHandler = (diagnostic: Diagnostic) => void;

export interface Manifest {
  $version: string;
  lastUpdated: number;
  npmRegistry: string;
  packages: Record<string, { integrity: string; tarball: string }>;
  resolutions: Record<string, string>;
  versions: Array<string>;
}
