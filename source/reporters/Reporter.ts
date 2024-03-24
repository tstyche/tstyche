import type { ResolvedConfig } from "#config";
import type { Event } from "#events";
import { OutputService } from "#output";

export abstract class Reporter {
  protected outputService: OutputService;

  constructor(readonly resolvedConfig: ResolvedConfig) {
    this.outputService = new OutputService();
  }

  abstract handleEvent([eventName, payload]: Event): void;
}
