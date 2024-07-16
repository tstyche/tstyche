import { type Diagnostic, DiagnosticCategory } from "#diagnostic";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";
import { CodeSpanText } from "./CodeSpanText.js";

interface DiagnosticTextProps {
  diagnostic: Diagnostic;
}

function DiagnosticText({ diagnostic }: DiagnosticTextProps) {
  const code = diagnostic.code ? <Text color={Color.Gray}> {diagnostic.code}</Text> : undefined;

  const text = Array.isArray(diagnostic.text) ? diagnostic.text : [diagnostic.text];

  const message = text.map((text, index) => (
    <Text>
      {index === 1 ? <Line /> : undefined}
      <Line>
        {text}
        {code}
      </Line>
    </Text>
  ));

  const related = diagnostic.related?.map((relatedDiagnostic) => <DiagnosticText diagnostic={relatedDiagnostic} />);

  const codeSpan = diagnostic.origin ? (
    <Text>
      <Line />
      <CodeSpanText diagnosticOrigin={diagnostic.origin} />
    </Text>
  ) : undefined;

  return (
    <Text>
      {message}
      {codeSpan}
      <Line />
      <Text indent={2}>{related}</Text>
    </Text>
  );
}

export function diagnosticText(diagnostic: Diagnostic): ScribblerJsx.Element {
  let prefix: ScribblerJsx.Element | undefined;

  switch (diagnostic.category) {
    case DiagnosticCategory.Error: {
      prefix = <Text color={Color.Red}>{"Error: "}</Text>;
      break;
    }

    case DiagnosticCategory.Warning: {
      prefix = <Text color={Color.Yellow}>{"Warning: "}</Text>;
      break;
    }

    default:
      break;
  }

  return (
    <Text>
      {prefix}
      <DiagnosticText diagnostic={diagnostic} />
    </Text>
  );
}
