import type { TestTree, TestTreeNode } from "#collect";
import { DiagnosticCategory, type DiagnosticOrigin, type SourceFile } from "#diagnostic";
import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import { SourceService } from "#source";
import type { CodeFrameOptions } from "./types.js";

interface BreadcrumbsTextProps {
  ancestor: TestTreeNode | TestTree;
}

function BreadcrumbsText({ ancestor }: BreadcrumbsTextProps) {
  const text: Array<string> = [];

  while ("name" in ancestor) {
    if (ancestor.name !== "") {
      text.push(ancestor.name);
    }

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
  squiggleColor: Color;
  squiggleWidth: number;
}

function SquiggleLineText({ gutterWidth, indentWidth = 0, squiggleColor, squiggleWidth }: SquiggleLineTextProps) {
  return (
    <Line>
      {" ".repeat(gutterWidth)}
      <Text color={Color.Gray}>{" | "}</Text>
      {" ".repeat(indentWidth)}
      <Text color={squiggleColor}>{"~".repeat(squiggleWidth === 0 ? 1 : squiggleWidth)}</Text>
    </Line>
  );
}

interface CodeFrameTextProps {
  diagnosticCategory: DiagnosticCategory;
  diagnosticOrigin: DiagnosticOrigin;
  options?: CodeFrameOptions | undefined;
}

export function CodeFrameText({ diagnosticCategory, diagnosticOrigin, options }: CodeFrameTextProps) {
  const linesAbove = options?.linesAbove ?? 2;
  const linesBelow = options?.linesBelow ?? 3;
  const showBreadcrumbs = options?.showBreadcrumbs ?? true;

  const sourceFile = SourceService.get(diagnosticOrigin.sourceFile);

  const lineMap = sourceFile.getLineStarts();

  const { character: firstMarkedLineCharacter, line: firstMarkedLine } = sourceFile.getLineAndCharacterOfPosition(
    diagnosticOrigin.start,
  );
  const { character: lastMarkedLineCharacter, line: lastMarkedLine } = sourceFile.getLineAndCharacterOfPosition(
    diagnosticOrigin.end,
  );

  const firstLine = Math.max(firstMarkedLine - linesAbove, 0);
  const lastLine = Math.min(lastMarkedLine + linesBelow, lineMap.length - 1);
  const gutterWidth = (lastLine + 1).toString().length + 2;

  let highlightColor: Color;

  switch (diagnosticCategory) {
    case DiagnosticCategory.Error:
      highlightColor = Color.Red;
      break;

    case DiagnosticCategory.Warning:
      highlightColor = Color.Yellow;
      break;
  }

  const codeFrame: Array<ScribblerJsx.Element> = [];

  for (let index = firstLine; index <= lastLine; index++) {
    const lineStart = lineMap[index];
    const lineEnd = index === lineMap.length - 1 ? sourceFile.text.length : lineMap[index + 1];

    const lineText = sourceFile.text.slice(lineStart, lineEnd).trimEnd().replace(/\t/g, " ");

    if (index >= firstMarkedLine && index <= lastMarkedLine) {
      codeFrame.push(
        <CodeLineText
          gutterWidth={gutterWidth}
          lineNumber={index + 1}
          lineNumberColor={highlightColor}
          lineText={lineText}
        />,
      );

      if (index === firstMarkedLine) {
        const squiggleLength =
          index === lastMarkedLine
            ? lastMarkedLineCharacter - firstMarkedLineCharacter
            : lineText.length - firstMarkedLineCharacter;

        codeFrame.push(
          <SquiggleLineText
            gutterWidth={gutterWidth}
            indentWidth={firstMarkedLineCharacter}
            squiggleColor={highlightColor}
            squiggleWidth={squiggleLength}
          />,
        );
      } else if (index === lastMarkedLine) {
        codeFrame.push(
          <SquiggleLineText
            gutterWidth={gutterWidth}
            squiggleColor={highlightColor}
            squiggleWidth={lastMarkedLineCharacter}
          />,
        );
      } else {
        codeFrame.push(
          <SquiggleLineText gutterWidth={gutterWidth} squiggleColor={highlightColor} squiggleWidth={lineText.length} />,
        );
      }
    } else {
      codeFrame.push(<CodeLineText gutterWidth={gutterWidth} lineNumber={index + 1} lineText={lineText} />);
    }
  }

  let breadcrumbs: ScribblerJsx.Element | undefined;

  if (showBreadcrumbs && diagnosticOrigin.assertion != null) {
    breadcrumbs = <BreadcrumbsText ancestor={diagnosticOrigin.assertion.parent} />;
  }

  const location = (
    <Line>
      {" ".repeat(gutterWidth + 2)}
      <Text color={Color.Gray}>{" at "}</Text>
      <Text color={Color.Cyan}>{Path.relative("", diagnosticOrigin.sourceFile.fileName)}</Text>
      <Text color={Color.Gray}>{`:${firstMarkedLine + 1}:${firstMarkedLineCharacter + 1}`}</Text>
      {breadcrumbs}
    </Line>
  );

  return (
    <Text>
      {codeFrame}
      <Line />
      {location}
    </Text>
  );
}
