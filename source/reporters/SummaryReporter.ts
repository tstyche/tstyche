import { OutputService, summaryText } from "#output";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class SummaryReporter extends BaseReporter {
  on([event, payload]: ReporterEvent): void {
    if (this.resolvedConfig.watch) {
      return;
    }

    if (event === "run:end") {
      OutputService.writeMessage(
        summaryText({
          duration: payload.result.timing.duration,
          expectCount: payload.result.expectCount,
          fileCount: payload.result.fileCount,
          targetCount: payload.result.targetCount,
          testCount: payload.result.testCount,
        }),
      );
    }
  }
}
