import type { Event } from "#events";
import { type OutputService, watchUsageText } from "#output";

export class WatchReporter {
  #outputService: OutputService;

  constructor(outputService: OutputService) {
    this.#outputService = outputService;
  }

  handleEvent([eventName]: Event): void {
    switch (eventName) {
      case "run:start": {
        this.#outputService.clearTerminal();
        break;
      }

      case "run:end": {
        this.#outputService.writeMessage(watchUsageText());
        break;
      }

      default:
        break;
    }
  }
}
