import type { Event, EventHandler } from "#events";
import type { OutputService } from "#output";

export abstract class Reporter implements EventHandler {
  protected outputService: OutputService;

  constructor(outputService: OutputService) {
    this.outputService = outputService;
  }

  abstract on([event, payload]: Event): void;
}
