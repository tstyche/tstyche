export class SuppressedDiagnosticText {
  static directiveRequires(): Array<string> {
    return [
      "Directive requires an argument.",
      "Add a fragment of the expected error message after the directive.",
      "To ignore the directive, append a '!' character after it.",
    ];
  }

  static messageDidNotMatch(): string {
    return "The diagnostic message did not match.";
  }

  static onlySingleError(): string {
    return "Only a single error can be suppressed.";
  }

  static suppressedError(count = 1): string {
    return `The suppressed error${count === 1 ? "" : "s"}:`;
  }
}
