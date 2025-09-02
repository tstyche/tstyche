import { type ResultCounts, ResultStatus, type ResultTiming } from "#result";
import { Color } from "#scribbler";

export function getStatusColor(status: ResultStatus): Color {
  switch (status) {
    case ResultStatus.Runs:
      return Color.Yellow;

    case ResultStatus.Passed:
    case ResultStatus.Matched:
      return Color.Green;

    case ResultStatus.Failed:
      return Color.Red;

    case ResultStatus.Fixme:
    case ResultStatus.Skipped:
    case ResultStatus.Ignored:
      return Color.Yellow;

    case ResultStatus.Todo:
      return Color.Magenta;
  }
}

export function duration(timing: ResultTiming): number {
  return timing.end - timing.start;
}

export function total(counts: ResultCounts): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}
