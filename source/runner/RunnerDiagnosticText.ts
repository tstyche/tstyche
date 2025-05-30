export class RunnerDiagnosticText {
  static considerRemoving(target: string): string {
    return `Consider removing the ${target}.`;
  }

  static assertionWasSupposedToFail(): string {
    return "The assertion was supposed to fail, but it passed.";
  }
}
