import { duration, type ResultCounts, type ResultTiming, total } from "#result";
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

interface CountsTextProps {
  counts: ResultCounts;
}

function CountsText({ counts }: CountsTextProps) {
  const countsTotal = total(counts);

  if (countsTotal === 0) {
    return null;
  }

  return (
    <Text>
      {counts.failed > 0 ? (
        <Text>
          <Text color={Color.Red}>{counts.failed} failed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {counts.fixme > 0 ? (
        <Text>
          <Text color={Color.Yellow}>{counts.fixme} fixme</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {counts.skipped > 0 ? (
        <Text>
          <Text color={Color.Yellow}>{counts.skipped} skipped</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {counts.todo > 0 ? (
        <Text>
          <Text color={Color.Magenta}>{counts.todo} todo</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {counts.passed > 0 ? (
        <Text>
          <Text color={Color.Green}>{counts.passed} passed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      <Text>{countsTotal} total</Text>
    </Text>
  );
}

interface DurationTextProps {
  timing: ResultTiming;
}

function DurationText({ timing }: DurationTextProps) {
  const seconds = duration(timing) / 1000;
  return <Text>{`${Math.round(seconds * 10) / 10}s`}</Text>;
}

interface SummaryTextOptions {
  targetCounts: ResultCounts;
  fileCounts: ResultCounts;
  testCounts: ResultCounts;
  assertionCounts: ResultCounts;
  timing: ResultTiming;
}

export function summaryText({
  targetCounts,
  fileCounts,
  testCounts,
  assertionCounts,
  timing,
}: SummaryTextOptions): ScribblerJsx.Element {
  const targetCountsText = <RowText label="Targets" text={<CountsText counts={targetCounts} />} />;
  const fileCountsText = <RowText label="Test files" text={<CountsText counts={fileCounts} />} />;
  const testCountsText = <RowText label="Tests" text={<CountsText counts={testCounts} />} />;
  const assertionCountsText = <RowText label="Assertions" text={<CountsText counts={assertionCounts} />} />;
  const durationText = <RowText label="Duration" text={<DurationText timing={timing} />} />;

  return (
    <Text>
      {targetCountsText}
      {fileCountsText}
      {testCountsText}
      {assertionCountsText}
      {durationText}
    </Text>
  );
}
