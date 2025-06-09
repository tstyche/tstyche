export class SuppressedDiagnosticText {
  static messageDidNotMatch(): string {
    return "The diagnostic message did not match.";
  }

  static raisedError(count = 1): string {
    return `The raised error${count === 1 ? "" : "s"}:`;
  }
}
