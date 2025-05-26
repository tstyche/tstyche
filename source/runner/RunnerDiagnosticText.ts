export class RunnerDiagnosticText {
  static considerRemoving(target: string): string {
    return `Consider removing the ${target}.`;
  }

  static assertionSupposedTo(action: string): string {
    return `The assertion was supposed to ${action}, but it passed.`;
  }
}
