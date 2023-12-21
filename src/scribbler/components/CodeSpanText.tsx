import type { DiagnosticOrigin } from "#diagnostic";
import { Color } from "../Color.js";
import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";
import { RelativePathText } from "./RelativePathText.js";

export class CodeSpanText implements JSX.ElementClass {
  constructor(readonly props: DiagnosticOrigin) {}

  render(): JSX.Element {
    const lastLineInFile = this.props.file.getLineAndCharacterOfPosition(this.props.file.text.length).line;

    const { character: markedCharacter, line: markedLine } = this.props.file.getLineAndCharacterOfPosition(
      this.props.start,
    );
    const firstLine = Math.max(markedLine - 2, 0);
    const lastLine = Math.min(firstLine + 5, lastLineInFile);
    const lineNumberMaxWidth = `${lastLine + 1}`.length;

    const codeSpan: Array<JSX.Element> = [];

    for (let i = firstLine; i <= lastLine; i++) {
      const lineStart = this.props.file.getPositionOfLineAndCharacter(i, 0);
      const lineEnd =
        i === lastLineInFile ? this.props.file.text.length : this.props.file.getPositionOfLineAndCharacter(i + 1, 0);

      const lineNumberText = String(i + 1);
      const lineText = this.props.file.text.slice(lineStart, lineEnd).trimEnd().replace(/\t/g, " ");

      if (i === markedLine) {
        codeSpan.push(
          <Line>
            <Text color={Color.Red}>{">"}</Text> {lineNumberText.padStart(lineNumberMaxWidth)}{" "}
            <Text color={Color.Gray}>|</Text> {lineText}
          </Line>,
        );
        codeSpan.push(
          <Line>
            {" ".repeat(lineNumberMaxWidth + 3)}
            <Text color={Color.Gray}>|</Text>
            {" ".repeat(markedCharacter + 1)}
            <Text color={Color.Red}>{"^"}</Text>
          </Line>,
        );
      } else {
        codeSpan.push(
          <Line>
            {" ".repeat(2)}
            <Text color={Color.Gray}>
              {lineNumberText.padStart(lineNumberMaxWidth)} | {lineText || ""}
            </Text>
          </Line>,
        );
      }
    }

    const breadcrumbs = this.props.breadcrumbs?.flatMap((ancestor) => [
      <Text color={Color.Gray}> ❭ </Text>,
      <Text>{ancestor}</Text>,
    ]);

    const location = (
      <Line>
        {" ".repeat(lineNumberMaxWidth + 5)}
        <Text color={Color.Gray}>at</Text>{" "}
        <Text color={Color.Cyan}>
          <RelativePathText to={this.props.file.fileName} />
        </Text>
        <Text color={Color.Gray}>
          :{String(markedLine + 1)}:{String(markedCharacter + 1)}
        </Text>
        {breadcrumbs}
      </Line>
    );

    return (
      <Text>
        {codeSpan}
        <Line />
        {location}
      </Text>
    );
  }
}
