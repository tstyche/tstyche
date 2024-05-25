import type { Event } from "#events";
import { type OutputService, watchModeUsageText } from "#output";

export class WatchModeReporter {
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
        this.#outputService.writeMessage(watchModeUsageText());
        break;
      }

      default:
        break;
    }
  }
}
