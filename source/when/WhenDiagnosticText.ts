export class WhenDiagnosticText {
  static actionIsNotSupported(actionNameText: string): string {
    return `The '.${actionNameText}()' action is not supported.`;
  }
}
