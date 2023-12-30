import { fileURLToPath } from "node:url";
import { Path } from "#path";
import { type FileResultStatus, ResultStatus } from "#result";
import { Color } from "../Color.js";
import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";

class FileNameText implements JSX.ElementClass {
  constructor(readonly props: { filePath: string }) {}

  render(): JSX.Element {
    const relativePath = Path.relative("", this.props.filePath);
    const lastPathSeparator = relativePath.lastIndexOf("/");

    const directoryNameText = relativePath.slice(0, lastPathSeparator + 1);
    const fileNameText = relativePath.slice(lastPathSeparator + 1);

    return (
      <Text>
        <Text color={Color.Gray}>{directoryNameText}</Text>
        {fileNameText}
      </Text>
    );
  }
}

export function fileStatusText(status: FileResultStatus, testFile: URL): JSX.Element {
  let statusColor: Color;
  let statusText: string;

  switch (status) {
    case ResultStatus.Runs:
      statusColor = Color.Yellow;
      statusText = "runs";
      break;
    case ResultStatus.Passed:
      statusColor = Color.Green;
      statusText = "pass";
      break;
    case ResultStatus.Failed:
      statusColor = Color.Red;
      statusText = "fail";
      break;
  }

  return (
    <Line>
      <Text color={statusColor}>{statusText}</Text> <FileNameText filePath={fileURLToPath(testFile)} />
    </Line>
  );
}
