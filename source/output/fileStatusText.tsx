import type { FileLocation } from "#file";
import { Path } from "#path";
import { type FileResultStatus, ResultStatus } from "#result";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import { getStatusColor } from "./helpers.js";

interface FileNameTextProps {
  filePath: string;
}

function FileNameText({ filePath }: FileNameTextProps) {
  const relativePath = Path.relative("", filePath);
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

export function fileStatusText(status: FileResultStatus, file: FileLocation): ScribblerJsx.Element {
  let statusText: string;

  switch (status) {
    case ResultStatus.Runs:
      statusText = "runs";
      break;

    case ResultStatus.Passed:
      statusText = "pass";
      break;

    case ResultStatus.Failed:
      statusText = "fail";
      break;
  }

  return (
    <Line>
      <Text color={getStatusColor(status)}>{statusText}</Text> <FileNameText filePath={file.path} />
    </Line>
  );
}
