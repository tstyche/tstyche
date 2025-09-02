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
  total: number;
}

function CountsText({ counts, total }: CountsTextProps) {
  return (
    <Text>
      {counts.failed > 0 ? (
        <Text>
          <Text color={Color.Red}>{counts.failed} failed</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {"fixme" in counts && counts.fixme > 0 ? (
        <Text>
          <Text color={Color.Yellow}>{counts.fixme} fixme</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {"skipped" in counts && counts.skipped > 0 ? (
        <Text>
          <Text color={Color.Yellow}>{counts.skipped} skipped</Text>
          <Text>{", "}</Text>
        </Text>
      ) : undefined}
      {"todo" in counts && counts.todo > 0 ? (
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
      <Text>{total} total</Text>
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
  const targetCountsTotal = total(targetCounts);
  const targetCountsText = (
    <RowText label="Targets" text={<CountsText counts={targetCounts} total={targetCountsTotal} />} />
  );

  const fileCountsTotal = total(fileCounts);
  const fileCountsText = (
    <RowText label="Test files" text={<CountsText counts={fileCounts} total={fileCountsTotal} />} />
  );

  const testCountsTotal = total(testCounts);
  const testCountsText =
    testCountsTotal > 0 ? (
      <RowText label="Tests" text={<CountsText counts={testCounts} total={testCountsTotal} />} />
    ) : undefined;

  const assertionCountsTotal = total(assertionCounts);
  const assertionCountsText =
    assertionCountsTotal > 0 ? (
      <RowText label="Assertions" text={<CountsText counts={assertionCounts} total={assertionCountsTotal} />} />
    ) : undefined;

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
