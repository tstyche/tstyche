import type { DiagnosticOrigin } from "#diagnostic";
import { Path } from "#path";
import { Color, Line, Text } from "#scribbler";

export class CodeSpanText implements JSX.ElementClass {
  constructor(readonly props: DiagnosticOrigin) {}

  render(): JSX.Element {
    const lastLineInFile = this.props.file.getLineAndCharacterOfPosition(this.props.file.text.length).line;

    const { character: markedCharacter, line: markedLine } = this.props.file.getLineAndCharacterOfPosition(
      this.props.start,
    );
    const firstLine = Math.max(markedLine - 2, 0);
    const lastLine = Math.min(firstLine + 5, lastLineInFile);
    const lineNumberMaxWidth = String(lastLine + 1).length;

    const codeSpan: Array<JSX.Element> = [];

    for (let index = firstLine; index <= lastLine; index++) {
      const lineStart = this.props.file.getPositionOfLineAndCharacter(index, 0);
      const lineEnd =
        index === lastLineInFile
          ? this.props.file.text.length
          : this.props.file.getPositionOfLineAndCharacter(index + 1, 0);

      const lineNumberText = String(index + 1);
      const lineText = this.props.file.text.slice(lineStart, lineEnd).trimEnd().replace(/\t/g, " ");

      if (index === markedLine) {
        codeSpan.push(
          <Line>
            <Text color={Color.Red}>{">"}</Text> {lineNumberText.padStart(lineNumberMaxWidth)}{" "}
            <Text color={Color.Gray}>|</Text> {lineText}
          </Line>,
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
      <Text color={Color.Gray}>{" ❭ "}</Text>,
      <Text>{ancestor}</Text>,
    ]);

    const location = (
      <Line>
        {" ".repeat(lineNumberMaxWidth + 5)}
        <Text color={Color.Gray}>at</Text> <Text color={Color.Cyan}>{Path.relative("", this.props.file.fileName)}</Text>
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
