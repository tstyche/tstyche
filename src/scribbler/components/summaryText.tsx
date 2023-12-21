import type { ResultCount } from "#result";
import { Color } from "../Color.js";
import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";

class RowText implements JSX.ElementClass {
  constructor(readonly props: { label: string; text: JSX.Element }) {}

  render(): JSX.Element {
    return (
      <Line>
        {`${this.props.label}:`.padEnd(12)}
        {this.props.text}
      </Line>
    );
  }
}

class CountText implements JSX.ElementClass {
  constructor(
    readonly props: {
      failed: number;
      passed: number;
      skipped: number;
      todo: number;
      total: number;
    },
  ) {}

  render(): JSX.Element {
    return (
      <Text>
        {this.props.failed > 0 ? (
          <Text>
            <Text color={Color.Red}>{String(this.props.failed)} failed</Text>
            <Text>, </Text>
          </Text>
        ) : undefined}
        {this.props.skipped > 0 ? (
          <Text>
            <Text color={Color.Yellow}>{String(this.props.skipped)} skipped</Text>
            <Text>, </Text>
          </Text>
        ) : undefined}
        {this.props.todo > 0 ? (
          <Text>
            <Text color={Color.Magenta}>{String(this.props.todo)} todo</Text>
            <Text>, </Text>
          </Text>
        ) : undefined}
        {this.props.passed > 0 ? (
          <Text>
            <Text color={Color.Green}>{String(this.props.passed)} passed</Text>
            <Text>, </Text>
          </Text>
        ) : undefined}
        <Text>
          {String(this.props.total)}
          <Text> total</Text>
        </Text>
      </Text>
    );
  }
}

class DurationText implements JSX.ElementClass {
  constructor(readonly props: { duration: number }) {}

  render(): JSX.Element {
    const duration = this.props.duration / 1000;

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <Text>
        {minutes > 0 ? `${minutes}m ` : undefined}
        {`${Math.round(seconds * 10) / 10}s`}
      </Text>
    );
  }
}

class MatchText implements JSX.ElementClass {
  constructor(readonly props: { text: Array<string> | string }) {}

  render(): JSX.Element {
    if (typeof this.props.text === "string") {
      return <Text>'{this.props.text}'</Text>;
    }

    if (this.props.text.length <= 1) {
      return <Text>'{...this.props.text}'</Text>;
    }

    const lastItem = this.props.text.pop();

    return (
      <Text>
        {this.props.text.map((match, index, list) => (
          <Text>
            '{match}'{index === list.length - 1 ? <Text> </Text> : <Text color={Color.Gray}>, </Text>}
          </Text>
        ))}
        <Text color={Color.Gray}>or</Text> '{lastItem}'
      </Text>
    );
  }
}

class RanFilesText implements JSX.ElementClass {
  constructor(
    readonly props: {
      onlyMatch: string | undefined;
      pathMatch: Array<string>;
      skipMatch: string | undefined;
    },
  ) {}

  render(): JSX.Element {
    const testNameMatch: Array<JSX.Element> = [];

    if (this.props.onlyMatch != null) {
      testNameMatch.push(
        <Text>
          <Text color={Color.Gray}>matching </Text>
          <MatchText text={this.props.onlyMatch} />
        </Text>,
      );
    }

    if (this.props.skipMatch != null) {
      testNameMatch.push(
        <Text>
          {this.props.onlyMatch == null ? undefined : <Text color={Color.Gray}> and </Text>}
          <Text color={Color.Gray}>not matching </Text>
          <MatchText text={this.props.skipMatch} />
        </Text>,
      );
    }

    let pathMatch: JSX.Element | undefined;

    if (this.props.pathMatch.length > 0) {
      pathMatch = (
        <Text>
          <Text color={Color.Gray}>test files matching </Text>
          <MatchText text={this.props.pathMatch} />
          <Text color={Color.Gray}>.</Text>
        </Text>
      );
    } else {
      pathMatch = <Text color={Color.Gray}>all test files.</Text>;
    }

    return (
      <Line>
        <Text color={Color.Gray}>Ran </Text>
        {testNameMatch.length > 0 ? <Text color={Color.Gray}>tests </Text> : undefined}
        {testNameMatch}
        {testNameMatch.length > 0 ? <Text color={Color.Gray}> in </Text> : undefined}
        {pathMatch}
      </Line>
    );
  }
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
}): JSX.Element {
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
      <RowText label="Duration" text={<DurationText duration={duration} />} />
      <Line />
      <RanFilesText onlyMatch={onlyMatch} pathMatch={pathMatch} skipMatch={skipMatch} />
    </Text>
  );
}
