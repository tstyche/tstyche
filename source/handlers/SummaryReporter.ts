import type { Event } from "#events";
import { type OutputService, summaryText } from "#output";

export class SummaryReporter {
  #outputService: OutputService;

  constructor(outputService: OutputService) {
    this.#outputService = outputService;
  }

  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "run:end": {
        this.#outputService.writeMessage(
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
