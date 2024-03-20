import type { Event } from "#events";
import { watchModeUsageText } from "#output";
import { Reporter } from "./Reporter.js";

export class WatchModeReporter extends Reporter {
  handleEvent([eventName]: Event): void {
    switch (eventName) {
      case "run:start":
        this.logger.clear();
        break;

      case "run:end":
        this.logger.writeMessage(watchModeUsageText());
        break;

      default:
        break;
    }
  }
}
