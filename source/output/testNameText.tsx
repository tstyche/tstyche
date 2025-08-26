import { ResultStatusFlags } from "#result";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function testNameText(
  status: Exclude<ResultStatusFlags, ResultStatusFlags.Runs>,
  name: string,
  indent = 0,
): ScribblerJsx.Element {
  let statusColor: Color;
  let statusText: string;

  switch (status) {
    case ResultStatusFlags.Passed:
      statusColor = Color.Green;
      statusText = "+";
      break;

    case ResultStatusFlags.Failed:
      statusColor = Color.Red;
      statusText = "×";
      break;

    case ResultStatusFlags.Fixme:
      statusColor = Color.Yellow;
      statusText = "- fixme";
      break;

    case ResultStatusFlags.Skipped:
      statusColor = Color.Yellow;
      statusText = "- skip";
      break;

    case ResultStatusFlags.Todo:
      statusColor = Color.Magenta;
      statusText = "- todo";
      break;
  }

  return (
    <Line indent={indent + 1}>
      <Text color={statusColor}>{statusText}</Text> <Text color={Color.Gray}>{name}</Text>
    </Line>
  );
}
