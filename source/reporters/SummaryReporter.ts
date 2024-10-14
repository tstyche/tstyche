import { OutputService, summaryText } from "#output";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class SummaryReporter extends BaseReporter {
  on([event, payload]: ReporterEvent): void {
    if (this.resolvedConfig.watch === true) {
      return;
    }

    if (event === "run:end") {
      OutputService.writeMessage(
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
    }
  }
}
