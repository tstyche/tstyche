export class DirectiveDiagnosticText {
  static doesNotTakeArgument(directiveName: string): string {
    return `Directive '${directiveName}' does not take an argument.`;
  }

  static isNotSupported(directive: string): string {
    return `The '${directive}' directive is not supported.`;
  }

  static requiresArgument(directiveName: string): string {
    return `Directive '${directiveName}' requires an argument.`;
  }
}
