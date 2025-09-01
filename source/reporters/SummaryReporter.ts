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
          targetCounts: payload.result.targetCounts,
          fileCounts: payload.result.fileCounts,
          testCounts: payload.result.testCounts,
          assertionCounts: payload.result.assertionCounts,
          timing: payload.result.timing,
        }),
      );
    }
  }
}
