import { ResultStatus } from "#result";
import { Color, type ScribblerJsx, Text } from "#scribbler";

export function dotStatusText(status: ResultStatus.Passed | ResultStatus.Failed): ScribblerJsx.Element {
  let statusColor: Color | undefined;
  let statusText: string;

  switch (status) {
    case ResultStatus.Passed:
      statusText = "·";
      break;

    case ResultStatus.Failed:
      statusColor = Color.Red;
      statusText = "×";
      break;
  }

  return <Text color={statusColor}>{statusText}</Text>;
}
