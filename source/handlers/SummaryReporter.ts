import type { Event, EventHandler } from "#events";
import { summaryText } from "#output";
import { Reporter } from "./Reporter.js";

export class SummaryReporter extends Reporter implements EventHandler {
  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "run:end": {
        this.outputService.writeMessage(
          summaryText({
            duration: payload.result.timing.duration,
            expectCount: payload.result.expectCount,
            fileCount: payload.result.fileCount,
            onlyMatch: payload.result.resolvedConfig.only,
            pathMatch: payload.result.resolvedConfig.pathMatch,
            skipMatch: payload.result.resolvedConfig.skip,
            targetCount: payload.result.targetCount,
            testCount: payload.result.testCount,
          }),
        );
        break;
      }

      default:
        break;
    }
  }
}
