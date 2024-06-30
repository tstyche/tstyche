import type { DiagnosticOrigin } from "#diagnostic";
import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function CodeSpanText(diagnosticOrigin: DiagnosticOrigin) {
  const lastLineInFile = diagnosticOrigin.sourceFile.getLineAndCharacterOfPosition(
    diagnosticOrigin.sourceFile.text.length,
  ).line;

  const { character: firstMarkedLineCharacter, line: firstMarkedLine } =
    diagnosticOrigin.sourceFile.getLineAndCharacterOfPosition(diagnosticOrigin.start);
  const { character: lastMarkedLineCharacter, line: lastMarkedLine } =
    diagnosticOrigin.sourceFile.getLineAndCharacterOfPosition(diagnosticOrigin.end);

  const firstLine = Math.max(firstMarkedLine - 2, 0);
  const lastLine = Math.min(firstLine + 5, lastLineInFile);
  const lineNumberMaxWidth = String(lastLine + 1).length;

  const codeSpan: Array<ScribblerJsx.Element> = [];

  for (let index = firstLine; index <= lastLine; index++) {
    const lineStart = diagnosticOrigin.sourceFile.getPositionOfLineAndCharacter(index, 0);
    const lineEnd =
      index === lastLineInFile
        ? diagnosticOrigin.sourceFile.text.length
        : diagnosticOrigin.sourceFile.getPositionOfLineAndCharacter(index + 1, 0);

    const lineNumberText = String(index + 1);
    const lineText = diagnosticOrigin.sourceFile.text.slice(lineStart, lineEnd).trimEnd().replace(/\t/g, " ");

    if (index >= firstMarkedLine && index <= lastMarkedLine) {
      codeSpan.push(
        <Line>
          {" ".repeat(2)}
          <Text color={Color.Red}>{lineNumberText.padStart(lineNumberMaxWidth)}</Text>
          <Text color={Color.Gray}> | </Text>
          {lineText}
        </Line>,
      );

      if (index === firstMarkedLine) {
        codeSpan.push(
          <Line>
            {" ".repeat(lineNumberMaxWidth + 2)}
            <Text color={Color.Gray}> | </Text>
            {" ".repeat(firstMarkedLineCharacter)}
            <Text color={Color.Red}>
              {"~".repeat(
                index === lastMarkedLine
                  ? lastMarkedLineCharacter - firstMarkedLineCharacter
                  : lineText.length - firstMarkedLineCharacter,
              )}
            </Text>
          </Line>,
        );
      } else if (index === lastMarkedLine) {
        codeSpan.push(
          <Line>
            {" ".repeat(lineNumberMaxWidth + 2)}
            <Text color={Color.Gray}> | </Text>
            <Text color={Color.Red}>{"~".repeat(lastMarkedLineCharacter)}</Text>
          </Line>,
        );
      } else {
        codeSpan.push(
          <Line>
            {" ".repeat(lineNumberMaxWidth + 2)}
            <Text color={Color.Gray}> | </Text>
            <Text color={Color.Red}>{"~".repeat(lineText.length)}</Text>
          </Line>,
        );
      }
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

  const breadcrumbs = diagnosticOrigin.breadcrumbs?.flatMap((ancestor) => [
    <Text color={Color.Gray}>{" ❭ "}</Text>,
    <Text>{ancestor}</Text>,
  ]);

  const location = (
    <Line>
      {" ".repeat(lineNumberMaxWidth + 5)}
      <Text color={Color.Gray}>at</Text>
      <Text> </Text>
      <Text color={Color.Cyan}>{Path.relative("", diagnosticOrigin.sourceFile.fileName)}</Text>
      <Text color={Color.Gray}>
        :{String(firstMarkedLine + 1)}:{String(firstMarkedLineCharacter + 1)}
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
