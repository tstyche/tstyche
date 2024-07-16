import type { TestMember, TestTree } from "#collect";
import type { DiagnosticOrigin } from "#diagnostic";
import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

interface BreadcrumbsTextProps {
  ancestor: TestMember | TestTree;
}

function BreadcrumbsText({ ancestor }: BreadcrumbsTextProps) {
  const text: Array<string> = [];

  while ("name" in ancestor) {
    text.push(ancestor.name);
    ancestor = ancestor.parent;
  }

  text.push("");

  return <Text color={Color.Gray}>{text.reverse().join(" ❭ ")}</Text>;
}

interface CodeLineTextProps {
  gutterWidth: number;
  lineNumber: number;
  lineNumberColor?: Color;
  lineText: string;
}

function CodeLineText({ gutterWidth, lineNumber, lineNumberColor = Color.Gray, lineText }: CodeLineTextProps) {
  return (
    <Line>
      <Text color={lineNumberColor}>{lineNumber.toString().padStart(gutterWidth)}</Text>
      <Text color={Color.Gray}>{" | "}</Text>
      {lineText}
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
      <Text color={Color.Gray}>{" | "}</Text>
      {" ".repeat(indentWidth)}
      <Text color={Color.Red}>{"~".repeat(squiggleWidth === 0 ? 1 : squiggleWidth)}</Text>
    </Line>
  );
}

interface CodeSpanTextProps {
  diagnosticOrigin: DiagnosticOrigin;
}

export function CodeSpanText({ diagnosticOrigin }: CodeSpanTextProps) {
  const lastLineInFile = diagnosticOrigin.sourceFile.getLineAndCharacterOfPosition(
    diagnosticOrigin.sourceFile.text.length,
  ).line;

  const { character: firstMarkedLineCharacter, line: firstMarkedLine } =
    diagnosticOrigin.sourceFile.getLineAndCharacterOfPosition(diagnosticOrigin.start);
  const { character: lastMarkedLineCharacter, line: lastMarkedLine } =
    diagnosticOrigin.sourceFile.getLineAndCharacterOfPosition(diagnosticOrigin.end);

  const firstLine = Math.max(firstMarkedLine - 2, 0);
  const lastLine = Math.min(firstLine + 5, lastLineInFile);
  const gutterWidth = (lastLine + 1).toString().length + 2;

  const codeSpan: Array<ScribblerJsx.Element> = [];

  for (let index = firstLine; index <= lastLine; index++) {
    const lineStart = diagnosticOrigin.sourceFile.getPositionOfLineAndCharacter(index, 0);
    const lineEnd =
      index === lastLineInFile
        ? diagnosticOrigin.sourceFile.text.length
        : diagnosticOrigin.sourceFile.getPositionOfLineAndCharacter(index + 1, 0);

    const lineText = diagnosticOrigin.sourceFile.text.slice(lineStart, lineEnd).trimEnd().replace(/\t/g, " ");

    if (index >= firstMarkedLine && index <= lastMarkedLine) {
      codeSpan.push(
        <CodeLineText
          gutterWidth={gutterWidth}
          lineNumber={index + 1}
          lineNumberColor={Color.Red}
          lineText={lineText}
        />,
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
      codeSpan.push(<CodeLineText gutterWidth={gutterWidth} lineNumber={index + 1} lineText={lineText} />);
    }
  }

  const location = (
    <Line>
      {" ".repeat(gutterWidth + 2)}
      <Text color={Color.Gray}>{" at "}</Text>
      <Text color={Color.Cyan}>{Path.relative("", diagnosticOrigin.sourceFile.fileName)}</Text>
      <Text color={Color.Gray}>{`:${firstMarkedLine + 1}:${firstMarkedLineCharacter + 1}`}</Text>
      {diagnosticOrigin.assertion && <BreadcrumbsText ancestor={diagnosticOrigin.assertion.parent} />}
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
