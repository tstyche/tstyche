import { ResultStatusFlags } from "#result";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function testNameText(
  status: Exclude<ResultStatusFlags, ResultStatusFlags.Runs>,
  name: string,
  indent = 0,
): ScribblerJsx.Element {
  let statusColor: Color;
  let statusText: string;

  // TODO

  // // ResultStatusFlags.Passed | ResultStatusFlags.Fixme
  // statusColor = Color.Red;
  // statusText = "× fixme"; // it passed, consider removing '@tstyche fixme'

  // // ResultStatusFlags.Failed | ResultStatusFlags.Fixme
  // statusColor = Color.Yellow;
  // statusText = "- fixme"; // it failed, but should be working at some point

  switch (status) {
    case ResultStatusFlags.Passed:
      statusColor = Color.Green;
      statusText = "+";
      break;

    case ResultStatusFlags.Failed:
      statusColor = Color.Red;
      statusText = "×";
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
