export class DirectiveDiagnosticText {
  static doesNotTakeArgument(): string {
    return "Directive does not take an argument.";
  }

  static isNotSupported(directive: string): string {
    return `The '${directive}' directive is not supported.`;
  }

  static requiresArgument(): string {
    return "Directive requires an argument.";
  }
}
