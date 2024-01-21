import type { Event } from "#events";
import { summaryText } from "#output";
import { Reporter } from "./Reporter.js";

export class SummaryReporter extends Reporter {
  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "end":
        this.logger.writeMessage(
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

      default:
        break;
    }
  }
}
