import { type Diagnostic, DiagnosticCategory } from "#diagnostic";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import { CodeFrameText } from "./CodeFrameText.js";
import type { CodeFrameOptions } from "./types.js";

interface DiagnosticTextProps {
  diagnostic: Diagnostic;
  highlightColor: Color;
  options?: CodeFrameOptions | undefined;
}

function DiagnosticText({ diagnostic, highlightColor, options }: DiagnosticTextProps) {
  const code = diagnostic.code ? <Text color={Color.Gray}> {diagnostic.code}</Text> : undefined;

  const text = Array.isArray(diagnostic.text) ? diagnostic.text : [diagnostic.text];

  const message = text.map((text, index) => (
    <Text>
      {index === 1 ? <Line /> : undefined}
      <Line>
        {text}
        {index === 0 ? code : undefined}
      </Line>
    </Text>
  ));

  const related = diagnostic.related?.map((relatedDiagnostic) => (
    <DiagnosticText diagnostic={relatedDiagnostic} highlightColor={highlightColor} options={options} />
  ));

  const codeFrame = diagnostic.origin ? (
    <Text>
      <Line />
      <CodeFrameText diagnosticOrigin={diagnostic.origin} highlightColor={highlightColor} options={options} />
    </Text>
  ) : undefined;

  return (
    <Text>
      {message}
      {codeFrame}
      <Line />
      <Text indent={2}>{related}</Text>
    </Text>
  );
}

export function diagnosticText(diagnostic: Diagnostic, options: CodeFrameOptions = {}): ScribblerJsx.Element {
  let highlightColor: Color;
  let prefix: ScribblerJsx.Element;

  switch (diagnostic.category) {
    case DiagnosticCategory.Error:
      highlightColor = Color.Red;
      prefix = <Text color={highlightColor}>{"Error: "}</Text>;
      break;

    case DiagnosticCategory.Cause:
      highlightColor = Color.Yellow;
      prefix = <Text color={highlightColor}>{"Cause: "}</Text>;
      break;

    case DiagnosticCategory.Warning:
      highlightColor = Color.Yellow;
      prefix = <Text color={highlightColor}>{"Warning: "}</Text>;
      break;
  }

  return (
    <Text>
      {prefix}
      <DiagnosticText diagnostic={diagnostic} highlightColor={highlightColor} options={options} />
    </Text>
  );
}
