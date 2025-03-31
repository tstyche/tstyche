import type { ResolvedConfig } from "#config";
import type { Reporter, ReporterEvent } from "./types.js";

export abstract class BaseReporter implements Reporter {
  protected resolvedConfig: ResolvedConfig;

  constructor(resolvedConfig: ResolvedConfig) {
    this.resolvedConfig = resolvedConfig;
  }

  abstract on([event, payload]: ReporterEvent): void;
}
