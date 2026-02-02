import { ResultStatus } from "#result";
import { Color, type ScribblerJsx, Text } from "#scribbler";

export function dotText(status: ResultStatus): ScribblerJsx.Element {
  let statusColor: Color | undefined;
  let statusText = "·";

  if (status === ResultStatus.Failed) {
    statusColor = Color.Red;
    statusText = "×";
  }

  return <Text color={statusColor}>{statusText}</Text>;
}
