import { type Diagnostic, DiagnosticCategory } from "#diagnostic";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import { CodeFrameText } from "./CodeFrameText.js";
import type { CodeFrameOptions } from "./types.js";

interface DiagnosticTextProps {
  codeFrameOptions?: CodeFrameOptions;
  diagnostic: Diagnostic;
}

function DiagnosticText({ codeFrameOptions, diagnostic }: DiagnosticTextProps) {
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

  const related = diagnostic.related?.map((relatedDiagnostic) => <DiagnosticText diagnostic={relatedDiagnostic} />);

  const codeFrame = diagnostic.origin ? (
    <Text>
      <Line />
      <CodeFrameText
        diagnosticCategory={diagnostic.category}
        diagnosticOrigin={diagnostic.origin}
        options={codeFrameOptions}
      />
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

export function diagnosticText(diagnostic: Diagnostic, codeFrameOptions: CodeFrameOptions = {}): ScribblerJsx.Element {
  let prefix: ScribblerJsx.Element | undefined;

  switch (diagnostic.category) {
    case DiagnosticCategory.Error:
      prefix = <Text color={Color.Red}>{"Error: "}</Text>;
      break;

    case DiagnosticCategory.Warning:
      prefix = <Text color={Color.Yellow}>{"Warning: "}</Text>;
      break;
  }

  return (
    <Text>
      {prefix}
      <DiagnosticText codeFrameOptions={codeFrameOptions} diagnostic={diagnostic} />
    </Text>
  );
}
