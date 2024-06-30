import type { DiagnosticOrigin } from "#diagnostic";
import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

interface CodeLineTextProps {
  children: string;
  gutterWidth: number;
  lineNumberColor?: Color;
  lineNumberText: string;
}

function CodeLineText({ children, gutterWidth, lineNumberColor = Color.Gray, lineNumberText }: CodeLineTextProps) {
  return (
    <Line>
      <Text color={lineNumberColor}>{lineNumberText.padStart(gutterWidth)}</Text>
      <Text color={Color.Gray}> | </Text>
      {children}
    </Line>
  );
}

interface SquiggleLineTextProps {
  gutterWidth: number;
  indentWidth?: number;
  squiggleWidth: number;
}

function SquiggleLineText({ gutterWidth, indentWidth = 0, squiggleWidth }: SquiggleLineTextProps) {
  return (
    <Line>
      {" ".repeat(gutterWidth)}
      <Text color={Color.Gray}> | </Text>
      {" ".repeat(indentWidth)}
      <Text color={Color.Red}>{"~".repeat(squiggleWidth)}</Text>
    </Line>
  );
}

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
  const gutterWidth = String(lastLine + 1).length + 2;

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
        <CodeLineText gutterWidth={gutterWidth} lineNumberColor={Color.Red} lineNumberText={lineNumberText}>
          {lineText}
        </CodeLineText>,
      );

      if (index === firstMarkedLine) {
        const squiggleLength =
          index === lastMarkedLine
            ? lastMarkedLineCharacter - firstMarkedLineCharacter
            : lineText.length - firstMarkedLineCharacter;

        codeSpan.push(
          <SquiggleLineText
            gutterWidth={gutterWidth}
            indentWidth={firstMarkedLineCharacter}
            squiggleWidth={squiggleLength}
          />,
        );
      } else if (index === lastMarkedLine) {
        codeSpan.push(<SquiggleLineText gutterWidth={gutterWidth} squiggleWidth={lastMarkedLineCharacter} />);
      } else {
        codeSpan.push(<SquiggleLineText gutterWidth={gutterWidth} squiggleWidth={lineText.length} />);
      }
    } else {
      codeSpan.push(
        <CodeLineText gutterWidth={gutterWidth} lineNumberText={lineNumberText}>
          {lineText}
        </CodeLineText>,
      );
    }
  }

  const breadcrumbs = diagnosticOrigin.breadcrumbs?.map((ancestor) => [
    <Text color={Color.Gray}>{" ❭ "}</Text>,
    <Text>{ancestor}</Text>,
  ]);

  const location = (
    <Line>
      {" ".repeat(gutterWidth + 2)}
      <Text color={Color.Gray}> at </Text>
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
