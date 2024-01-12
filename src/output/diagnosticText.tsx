import { type Diagnostic, DiagnosticCategory } from "#diagnostic";
import { Color, Line, Scribbler, Text } from "#scribbler";
import { CodeSpanText } from "./CodeSpanText.js";

class DiagnosticText implements JSX.ElementClass {
  constructor(readonly props: { diagnostic: Diagnostic }) {}

  render(): JSX.Element {
    const code =
      typeof this.props.diagnostic.code === "string" ? (
        <Text color={Color.Gray}> {this.props.diagnostic.code}</Text>
      ) : undefined;

    const text = Array.isArray(this.props.diagnostic.text) ? this.props.diagnostic.text : [this.props.diagnostic.text];

    const message = text.map((text, index) => (
      <Text>
        {index === 1 ? <Line /> : undefined}
        <Line>
          {text}
          {code}
        </Line>
      </Text>
    ));

    const related = this.props.diagnostic.related?.map((relatedDiagnostic) => (
      <DiagnosticText diagnostic={relatedDiagnostic} />
    ));

    const codeSpan = this.props.diagnostic.origin ? (
      <Text>
        <Line />
        <CodeSpanText {...this.props.diagnostic.origin} />
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
}

export function diagnosticText(diagnostic: Diagnostic): JSX.Element {
  let prefix: JSX.Element | undefined;

  switch (diagnostic.category) {
    case DiagnosticCategory.Error:
      prefix = <Text color={Color.Red}>Error: </Text>;
      break;

    // TODO warning logic could be added if there is a need
    // case DiagnosticCategory.Warning:
    //   prefix = <Text color={Color.Yellow}>Warning: </Text>;
    //   break;

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
