export class SuppressedDiagnosticText {
  static suppressedError(count = 1): string {
    return `The suppressed error${count === 1 ? "" : "s"}:`;
  }
}
