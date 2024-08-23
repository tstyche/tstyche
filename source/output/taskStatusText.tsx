import { Path } from "#path";
import { ResultStatus, type TaskResultStatus } from "#result";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import type { Task } from "#task";

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

export function taskStatusText(status: TaskResultStatus, task: Task): ScribblerJsx.Element {
  let statusColor: Color;
  let statusText: string;

  switch (status) {
    case ResultStatus.Runs: {
      statusColor = Color.Yellow;
      statusText = "runs";
      break;
    }
    case ResultStatus.Passed: {
      statusColor = Color.Green;
      statusText = "pass";
      break;
    }
    case ResultStatus.Failed: {
      statusColor = Color.Red;
      statusText = "fail";
      break;
    }
  }

  return (
    <Line>
      <Text color={statusColor}>{statusText}</Text> <FileNameText filePath={task.filePath} />
    </Line>
  );
}
