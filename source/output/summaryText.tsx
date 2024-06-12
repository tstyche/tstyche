import type { ResultCount } from "#result";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

interface RowTextProps {
  label: string;
  text: ScribblerJsx.Element;
}

function RowText({ label, text }: RowTextProps) {
  return (
    <Line>
      {`${label}:`.padEnd(12)}
      {text}
    </Line>
  );
}

interface CountTextProps {
  failed: number;
  passed: number;
  skipped: number;
  todo: number;
  total: number;
}

function CountText({ failed, passed, skipped, todo, total }: CountTextProps) {
  return (
    <Text>
      {failed > 0 ? (
        <Text>
          <Text color={Color.Red}>{String(failed)} failed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {skipped > 0 ? (
        <Text>
          <Text color={Color.Yellow}>{String(skipped)} skipped</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {todo > 0 ? (
        <Text>
          <Text color={Color.Magenta}>{String(todo)} todo</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {passed > 0 ? (
        <Text>
          <Text color={Color.Green}>{String(passed)} passed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      <Text>
        {String(total)}
        <Text>{" total"}</Text>
      </Text>
    </Text>
  );
}

interface DurationTextProps {
  duration: number;
}

function DurationText({ duration }: DurationTextProps) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <Text>
      {minutes > 0 ? `${String(minutes)}m ` : undefined}
      {`${String(Math.round(seconds * 10) / 10)}s`}
    </Text>
  );
}

interface MatchTextProps {
  text: Array<string> | string;
}

function MatchText({ text }: MatchTextProps) {
  if (typeof text === "string") {
    return <Text>'{text}'</Text>;
  }

  if (text.length <= 1) {
    return <Text>'{...text}'</Text>;
  }

  const lastItem = text.pop();

  return (
    <Text>
      {text.map((match, index, list) => (
        <Text>
          '{match}'{index === list.length - 1 ? <Text> </Text> : <Text color={Color.Gray}>{", "}</Text>}
        </Text>
      ))}
      <Text color={Color.Gray}>or</Text> '{lastItem}'
    </Text>
  );
}

interface RanFilesTextProps {
  onlyMatch: string | undefined;
  pathMatch: Array<string>;
  skipMatch: string | undefined;
}

function RanFilesText({ onlyMatch, pathMatch, skipMatch }: RanFilesTextProps) {
  const testNameMatchText: Array<ScribblerJsx.Element> = [];

  if (onlyMatch != null) {
    testNameMatchText.push(
      <Text>
        <Text color={Color.Gray}>{"matching "}</Text>
        <MatchText text={onlyMatch} />
      </Text>,
    );
  }

  if (skipMatch != null) {
    testNameMatchText.push(
      <Text>
        {onlyMatch == null ? undefined : <Text color={Color.Gray}>{" and "}</Text>}
        <Text color={Color.Gray}>{"not matching "}</Text>
        <MatchText text={skipMatch} />
      </Text>,
    );
  }

  let pathMatchText: ScribblerJsx.Element | undefined;

  if (pathMatch.length > 0) {
    pathMatchText = (
      <Text>
        <Text color={Color.Gray}>{"test files matching "}</Text>
        <MatchText text={pathMatch} />
        <Text color={Color.Gray}>.</Text>
      </Text>
    );
  } else {
    pathMatchText = <Text color={Color.Gray}>all test files.</Text>;
  }

  return (
    <Line>
      <Text color={Color.Gray}>{"Ran "}</Text>
      {testNameMatchText.length > 0 ? <Text color={Color.Gray}>{"tests "}</Text> : undefined}
      {testNameMatchText}
      {testNameMatchText.length > 0 ? <Text color={Color.Gray}>{" in "}</Text> : undefined}
      {pathMatchText}
    </Line>
  );
}

export function summaryText({
  duration,
  expectCount,
  fileCount,
  onlyMatch,
  pathMatch,
  skipMatch,
  targetCount,
  testCount,
}: {
  duration: number;
  expectCount: ResultCount;
  fileCount: ResultCount;
  onlyMatch: string | undefined;
  pathMatch: Array<string>;
  skipMatch: string | undefined;
  targetCount: ResultCount;
  testCount: ResultCount;
}): ScribblerJsx.Element {
  const targetCountText = (
    <RowText
      label="Targets"
      text={
        <CountText
          failed={targetCount.failed}
          passed={targetCount.passed}
          skipped={targetCount.skipped}
          todo={targetCount.todo}
          total={targetCount.total}
        />
      }
    />
  );

  const fileCountText = (
    <RowText
      label="Test files"
      text={
        <CountText
          failed={fileCount.failed}
          passed={fileCount.passed}
          skipped={fileCount.skipped}
          todo={fileCount.todo}
          total={fileCount.total}
        />
      }
    />
  );

  const testCountText = (
    <RowText
      label="Tests"
      text={
        <CountText
          failed={testCount.failed}
          passed={testCount.passed}
          skipped={testCount.skipped}
          todo={testCount.todo}
          total={testCount.total}
        />
      }
    />
  );

  const assertionCountText = (
    <RowText
      label="Assertions"
      text={
        <CountText
          failed={expectCount.failed}
          passed={expectCount.passed}
          skipped={expectCount.skipped}
          todo={expectCount.todo}
          total={expectCount.total}
        />
      }
    />
  );

  return (
    <Text>
      {targetCountText}
      {fileCountText}
      {testCount.total > 0 ? testCountText : undefined}
      {expectCount.total > 0 ? assertionCountText : undefined}
      <RowText label="Duration" text={<DurationText duration={duration / 1000} />} />
      <Line />
      <RanFilesText onlyMatch={onlyMatch} pathMatch={pathMatch} skipMatch={skipMatch} />
    </Text>
  );
}
