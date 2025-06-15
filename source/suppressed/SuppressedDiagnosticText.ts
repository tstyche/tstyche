export class SuppressedDiagnosticText {
  static messageDidNotMatch(): string {
    return "The diagnostic message did not match.";
  }

  static suppressedError(count = 1): string {
    return `The suppressed error${count === 1 ? "" : "s"}:`;
  }
}
