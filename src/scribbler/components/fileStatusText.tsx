import path from "node:path";
import { fileURLToPath } from "node:url";
import { type FileResultStatus, ResultStatus } from "#result";
import { Color } from "../Color.js";
import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";
import { RelativePathText } from "./RelativePathText.js";

class FileNameText implements JSX.ElementClass {
  constructor(readonly props: { filePath: string }) {}

  render(): JSX.Element {
    return (
      <Text>
        <Text color={Color.Gray}>
          <RelativePathText isDirectory={true} to={path.dirname(this.props.filePath)} />
        </Text>
        {path.basename(this.props.filePath)}
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
