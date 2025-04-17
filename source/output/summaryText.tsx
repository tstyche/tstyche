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
          <Text color={Color.Red}>{failed} failed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {skipped > 0 ? (
        <Text>
          <Text color={Color.Yellow}>{skipped} skipped</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {todo > 0 ? (
        <Text>
          <Text color={Color.Magenta}>{todo} todo</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {passed > 0 ? (
        <Text>
          <Text color={Color.Green}>{passed} passed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      <Text>{total} total</Text>
    </Text>
  );
}

interface DurationTextProps {
  seconds: number;
}

function DurationText({ seconds }: DurationTextProps) {
  return <Text>{`${Math.round(seconds * 10) / 10}s`}</Text>;
}

export function summaryText({
  duration,
  expectCount,
  fileCount,
  targetCount,
  testCount,
}: {
  duration: number;
  expectCount: ResultCount;
  fileCount: ResultCount;
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
      <RowText label="Duration" text={<DurationText seconds={duration / 1000} />} />
    </Text>
  );
}
