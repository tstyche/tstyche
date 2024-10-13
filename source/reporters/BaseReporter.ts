import type { ResolvedConfig } from "#config";
import type { OutputService } from "#output";
import type { Reporter, ReporterEvent } from "./types.js";

export abstract class BaseReporter implements Reporter {
  protected outputService: OutputService;
  protected resolvedConfig: ResolvedConfig;

  constructor(resolvedConfig: ResolvedConfig, outputService: OutputService) {
    this.resolvedConfig = resolvedConfig;
    this.outputService = outputService;
  }

  abstract on([event, payload]: ReporterEvent): void;
}
