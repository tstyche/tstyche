import { ResultStatus, type TestResultStatus } from "#result";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import { getStatusColor } from "./helpers.js";

export function testNameText(
  status: Exclude<TestResultStatus, ResultStatus.Runs>,
  name: string,
  indent = 0,
): ScribblerJsx.Element {
  let statusText: string;

  switch (status) {
    case ResultStatus.Passed:
      statusText = "+";
      break;

    case ResultStatus.Failed:
      statusText = "×";
      break;

    case ResultStatus.Skipped:
      statusText = "- skip";
      break;

    case ResultStatus.Fixme:
      statusText = "- fixme";
      break;

    case ResultStatus.Todo:
      statusText = "- todo";
      break;
  }

  return (
    <Line indent={indent + 1}>
      <Text color={getStatusColor(status)}>{statusText}</Text> <Text color={Color.Gray}>{name}</Text>
    </Line>
  );
}
