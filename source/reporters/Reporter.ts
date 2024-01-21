import type { ResolvedConfig } from "#config";
import type { Event } from "#events";
import { Logger } from "#logger";

export abstract class Reporter {
  protected logger: Logger;

  constructor(readonly resolvedConfig: ResolvedConfig) {
    this.logger = new Logger();
  }

  abstract handleEvent([eventName, payload]: Event): void;
}
